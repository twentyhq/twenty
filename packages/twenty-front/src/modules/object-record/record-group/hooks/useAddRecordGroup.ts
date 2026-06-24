import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { useSetRecordGroups } from '@/object-record/record-group/hooks/useSetRecordGroups';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { usePerformViewGroupAPIPersist } from '@/views/hooks/internal/usePerformViewGroupAPIPersist';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetViewFromState } from '@/views/hooks/useGetViewFromState';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useAddRecordGroup = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const { performViewGroupAPICreate } = usePerformViewGroupAPIPersist();
  const { getViewFromState } = useGetViewFromState();
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();
  const { setRecordGroupsFromViewGroups } = useSetRecordGroups();
  const { addToDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const currentViewIdCallbackState = useAtomComponentStateCallbackState(
    contextStoreCurrentViewIdComponentState,
  );

  const store = useStore();

  const addRecordGroup = async (recordId: string) => {
    if (!canPersistChanges) {
      return;
    }

    const currentViewId = store.get(currentViewIdCallbackState);

    if (!currentViewId) {
      return;
    }

    const view = getViewFromState(currentViewId);

    if (
      isUndefinedOrNull(view) ||
      !isDefined(view.mainGroupByFieldMetadataId)
    ) {
      return;
    }

    const recordAlreadyHasGroup = view.viewGroups.some(
      (viewGroup) => viewGroup.fieldValue === recordId,
    );

    if (recordAlreadyHasGroup) {
      return;
    }

    const maxPosition = view.viewGroups.reduce(
      (max, viewGroup) => Math.max(max, viewGroup.position),
      -1,
    );

    const newViewGroup: ViewGroup = {
      id: v4(),
      fieldValue: recordId,
      isVisible: true,
      position: maxPosition + 1,
    };

    addToDraft({
      key: 'viewGroups',
      items: [{ ...newViewGroup, viewId: currentViewId }],
    });
    applyChanges();

    setRecordGroupsFromViewGroups({
      viewId: currentViewId,
      mainGroupByFieldMetadataId: view.mainGroupByFieldMetadataId,
      viewGroups: [...view.viewGroups, newViewGroup],
      objectMetadataItem,
    });

    await performViewGroupAPICreate({
      inputs: [
        {
          id: newViewGroup.id,
          viewId: currentViewId,
          fieldValue: newViewGroup.fieldValue,
          isVisible: newViewGroup.isVisible,
          position: newViewGroup.position,
        },
      ],
    });
  };

  return { addRecordGroup };
};
