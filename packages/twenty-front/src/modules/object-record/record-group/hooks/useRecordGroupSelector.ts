import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { usePersistViewGroupRecords } from '@/views/hooks/internal/usePersistViewGroupRecords';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { ViewGroup } from '@/views/types/ViewGroup';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

type UseRecordGroupSelectorParams = {
  viewBarComponentId: string;
};

export const useRecordGroupSelector = ({
  viewBarComponentId,
}: UseRecordGroupSelectorParams) => {
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

        const viewGroupsToCreate = fieldMetadataItem.options.map(
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

        await createViewGroupRecords(viewGroupsToCreate, view);
      },
    [createViewGroupRecords, currentViewIdCallbackState, getViewFromCache],
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
