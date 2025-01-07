import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { usePersistViewGroupRecords } from '@/views/hooks/internal/usePersistViewGroupRecords';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { ViewGroup } from '@/views/types/ViewGroup';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

type UseHandleRecordGroupFieldParams = {
  viewBarComponentId: string;
};

export const useHandleRecordGroupField = ({
  viewBarComponentId,
}: UseHandleRecordGroupFieldParams) => {
  const { createViewGroupRecords, deleteViewGroupRecords } =
    usePersistViewGroupRecords();

  const currentViewIdCallbackState = useRecoilComponentCallbackStateV2(
    currentViewIdComponentState,
    viewBarComponentId,
  );

  const { getViewFromCache } = useGetViewFromCache();

  const handleRecordGroupFieldChange = useRecoilCallback(
    ({ snapshot }) =>
      async (fieldMetadataItem: FieldMetadataItem) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdCallbackState)
          .getValue();

        if (!currentViewId) {
          return;
        }

        const view = await getViewFromCache(currentViewId);

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

        if (viewGroupsToCreate.length > 0) {
          await createViewGroupRecords(viewGroupsToCreate, view);
        }

        if (viewGroupsToDelete.length > 0) {
          await deleteViewGroupRecords(viewGroupsToDelete);
        }
      },
    [
      createViewGroupRecords,
      deleteViewGroupRecords,
      currentViewIdCallbackState,
      getViewFromCache,
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

        const view = await getViewFromCache(currentViewId);

        if (isUndefinedOrNull(view)) {
          return;
        }

        if (view.viewGroups.length === 0) {
          return;
        }

        await deleteViewGroupRecords(view.viewGroups);
      },
    [deleteViewGroupRecords, currentViewIdCallbackState, getViewFromCache],
  );

  return { handleRecordGroupFieldChange, resetRecordGroupField };
};
