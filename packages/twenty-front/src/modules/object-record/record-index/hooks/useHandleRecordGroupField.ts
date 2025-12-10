import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useSetRecordGroups } from '@/object-record/record-group/hooks/useSetRecordGroups';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { usePersistView } from '@/views/hooks/internal/usePersistView';
import { useGetViewFromPrefetchState } from '@/views/hooks/useGetViewFromPrefetchState';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { type CoreView } from '~/generated/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useHandleRecordGroupField = () => {
  const currentViewIdCallbackState = useRecoilComponentCallbackState(
    contextStoreCurrentViewIdComponentState,
  );

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { getViewFromPrefetchState } = useGetViewFromPrefetchState();

  const { setRecordGroupsFromViewGroups } = useSetRecordGroups();

  const { updateView } = usePersistView();
  const { loadRecordIndexStates } = useLoadRecordIndexStates();
  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  const handleRecordGroupFieldChange = useRecoilCallback(
    ({ snapshot }) =>
      async (fieldMetadataItem: FieldMetadataItem) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdCallbackState)
          .getValue();

        if (!currentViewId) {
          return;
        }

        const view = getViewFromPrefetchState(currentViewId);

        if (isUndefinedOrNull(view)) {
          return;
        }

        if (
          isUndefinedOrNull(fieldMetadataItem.options) ||
          fieldMetadataItem.options.length === 0
        ) {
          return;
        }

        const updatedViewResult = await updateView({
          id: view.id,
          input: {
            mainGroupByFieldMetadataId: fieldMetadataItem.id,
          },
        });

        if (updatedViewResult.status === 'successful') {
          const updatedCoreView = updatedViewResult.response.data
            ?.updateCoreView as CoreView;

          if (isDefined(updatedCoreView)) {
            const updatedViewConverted = convertCoreViewToView(updatedCoreView);
            await loadRecordIndexStates(
              updatedViewConverted,
              objectMetadataItem,
            );
          }
        }

        const existingGroupKeys = new Set(
          view.viewGroups.map(
            (group) => `${view.mainGroupByFieldMetadataId}:${group.fieldValue}`,
          ),
        );

        const viewGroupsToCreate = fieldMetadataItem.options
          // Avoid creation of already existing view groups
          .filter(
            (option) =>
              !existingGroupKeys.has(`${fieldMetadataItem.id}:${option.value}`),
          )
          // Alphabetically sort the options by default
          .sort((a, b) => a.value.localeCompare(b.value))
          .map(
            (option, index) =>
              ({
                __typename: 'ViewGroup',
                id: v4(),
                fieldValue: option.value,
                isVisible: true,
                position: index,
              }) satisfies ViewGroup,
          );

        if (
          !existingGroupKeys.has(`${fieldMetadataItem.id}:`) &&
          fieldMetadataItem.isNullable === true
        ) {
          viewGroupsToCreate.push({
            __typename: 'ViewGroup',
            id: v4(),
            fieldValue: '',
            isVisible: true,
            position: fieldMetadataItem.options.length,
          } satisfies ViewGroup);
        }

        const newViewGroupsList = [
          ...view.viewGroups.filter(
            (_group) =>
              view.mainGroupByFieldMetadataId === fieldMetadataItem.id,
          ),
          ...viewGroupsToCreate,
        ];

        setRecordGroupsFromViewGroups({
          viewId: view.id,
          mainGroupByFieldMetadataId: fieldMetadataItem.id,
          viewGroups: newViewGroupsList,
          objectMetadataItem,
        });

        await refreshCoreViewsByObjectMetadataId(objectMetadataItem.id);
      },
    [
      currentViewIdCallbackState,
      getViewFromPrefetchState,
      updateView,
      setRecordGroupsFromViewGroups,
      objectMetadataItem,
      refreshCoreViewsByObjectMetadataId,
      loadRecordIndexStates,
    ],
  );

  const resetRecordGroupField = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdCallbackState)
          .getValue();

        if (!currentViewId) {
          return;
        }

        const view = getViewFromPrefetchState(currentViewId);

        if (isUndefinedOrNull(view)) {
          return;
        }

        if (view.viewGroups.length === 0) {
          return;
        }

        await updateView({
          id: view.id,
          input: {
            mainGroupByFieldMetadataId: null,
          },
        });
      },
    [currentViewIdCallbackState, getViewFromPrefetchState, updateView],
  );

  return { handleRecordGroupFieldChange, resetRecordGroupField };
};
