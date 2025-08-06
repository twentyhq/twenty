import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useSetRecordGroups } from '@/object-record/record-group/hooks/useSetRecordGroups';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { usePersistViewGroupRecords } from '@/views/hooks/internal/usePersistViewGroupRecords';
import { useGetViewFromPrefetchState } from '@/views/hooks/useGetViewFromPrefetchState';
import { ViewGroup } from '@/views/types/ViewGroup';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useHandleRecordGroupField = () => {
  const { createViewGroupRecords, deleteViewGroupRecords } =
    usePersistViewGroupRecords();

  const currentViewIdCallbackState = useRecoilComponentCallbackState(
    contextStoreCurrentViewIdComponentState,
  );

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { getViewFromPrefetchState } = useGetViewFromPrefetchState();

  const { setRecordGroupsFromViewGroups } = useSetRecordGroups();

  const handleRecordGroupFieldChange = useRecoilCallback(
    ({ snapshot }) =>
      async (fieldMetadataItem: FieldMetadataItem) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdCallbackState)
          .getValue();

        if (!currentViewId) {
          return;
        }

        const view = await getViewFromPrefetchState(currentViewId);

        if (isUndefinedOrNull(view)) {
          return;
        }

        if (
          isUndefinedOrNull(fieldMetadataItem.options) ||
          fieldMetadataItem.options.length === 0
        ) {
          return;
        }

        const existingGroupKeys = new Set(
          view.viewGroups.map(
            (group) => `${group.fieldMetadataId}:${group.fieldValue}`,
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
                fieldMetadataId: fieldMetadataItem.id,
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
            fieldMetadataId: fieldMetadataItem.id,
          } satisfies ViewGroup);
        }

        const viewGroupsToDelete = view.viewGroups.filter(
          (group) => group.fieldMetadataId !== fieldMetadataItem.id,
        );

        const newViewGroupsList = [
          ...view.viewGroups.filter(
            (group) => group.fieldMetadataId === fieldMetadataItem.id,
          ),
          ...viewGroupsToCreate,
        ];

        setRecordGroupsFromViewGroups(
          view.id,
          newViewGroupsList,
          objectMetadataItem,
        );

        if (viewGroupsToCreate.length > 0) {
          await createViewGroupRecords({ viewGroupsToCreate, viewId: view.id });
        }

        if (viewGroupsToDelete.length > 0) {
          await deleteViewGroupRecords(viewGroupsToDelete);
        }
      },
    [
      objectMetadataItem,
      currentViewIdCallbackState,
      getViewFromPrefetchState,
      setRecordGroupsFromViewGroups,
      createViewGroupRecords,
      deleteViewGroupRecords,
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

        await deleteViewGroupRecords(view.viewGroups);

        setRecordGroupsFromViewGroups(view.id, [], objectMetadataItem);
      },
    [
      deleteViewGroupRecords,
      currentViewIdCallbackState,
      getViewFromPrefetchState,
      setRecordGroupsFromViewGroups,
      objectMetadataItem,
    ],
  );

  return { handleRecordGroupFieldChange, resetRecordGroupField };
};
