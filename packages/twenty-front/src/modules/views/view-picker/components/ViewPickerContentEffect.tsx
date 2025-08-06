import { useEffect } from 'react';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { prefetchViewsFromObjectMetadataItemFamilySelector } from '@/prefetch/states/selector/prefetchViewsFromObjectMetadataItemFamilySelector';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { viewTypeIconMapping } from '@/views/types/ViewType';
import { useGetAvailableFieldsForKanban } from '@/views/view-picker/hooks/useGetAvailableFieldsForKanban';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerInputNameComponentState } from '@/views/view-picker/states/viewPickerInputNameComponentState';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerKanbanFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerKanbanFieldMetadataIdComponentState';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { viewPickerTypeComponentState } from '@/views/view-picker/states/viewPickerTypeComponentState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const ViewPickerContentEffect = () => {
  const setViewPickerSelectedIcon = useSetRecoilComponentState(
    viewPickerSelectedIconComponentState,
  );
  const setViewPickerInputName = useSetRecoilComponentState(
    viewPickerInputNameComponentState,
  );
  const { viewPickerMode } = useViewPickerMode();

  const [viewPickerKanbanFieldMetadataId, setViewPickerKanbanFieldMetadataId] =
    useRecoilComponentState(viewPickerKanbanFieldMetadataIdComponentState);

  const [viewPickerType, setViewPickerType] = useRecoilComponentState(
    viewPickerTypeComponentState,
  );

  const viewPickerReferenceViewId = useRecoilComponentValue(
    viewPickerReferenceViewIdComponentState,
  );

  const viewPickerIsDirty = useRecoilComponentValue(
    viewPickerIsDirtyComponentState,
  );

  const viewPickerIsPersisting = useRecoilComponentValue(
    viewPickerIsPersistingComponentState,
  );

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();
  const viewsOnCurrentObject = useRecoilValue(
    prefetchViewsFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const referenceView = viewsOnCurrentObject.find(
    (view) => view.id === viewPickerReferenceViewId,
  );

  const { availableFieldsForKanban } = useGetAvailableFieldsForKanban();

  useEffect(() => {
    if (
      isDefined(referenceView) &&
      !viewPickerIsPersisting &&
      !viewPickerIsDirty
    ) {
      const defaultIcon =
        viewTypeIconMapping(viewPickerType).displayName ?? 'IconTable';

      if (viewPickerMode === 'create-empty') {
        setViewPickerSelectedIcon(defaultIcon);
      } else {
        setViewPickerSelectedIcon(referenceView.icon);
      }
      setViewPickerInputName(referenceView.name);
      setViewPickerType(referenceView.type);
    }
  }, [
    referenceView,
    setViewPickerInputName,
    setViewPickerSelectedIcon,
    setViewPickerType,
    viewPickerIsPersisting,
    viewPickerIsDirty,
    viewPickerMode,
    viewPickerType,
  ]);

  useEffect(() => {
    if (
      isDefined(referenceView) &&
      availableFieldsForKanban.length > 0 &&
      viewPickerKanbanFieldMetadataId === ''
    ) {
      setViewPickerKanbanFieldMetadataId(
        // TODO: replace with viewGroups.fieldMetadataId
        referenceView.kanbanFieldMetadataId !== ''
          ? referenceView.kanbanFieldMetadataId
          : availableFieldsForKanban[0].id,
      );
    }
  }, [
    referenceView,
    availableFieldsForKanban,
    viewPickerKanbanFieldMetadataId,
    setViewPickerKanbanFieldMetadataId,
  ]);

  return <></>;
};
