import { useEffect } from 'react';

import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { ViewType } from '@/views/types/ViewType';
import { useGetAvailableFieldsForKanban } from '@/views/view-picker/hooks/useGetAvailableFieldsForKanban';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerInputNameComponentState } from '@/views/view-picker/states/viewPickerInputNameComponentState';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerKanbanFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerKanbanFieldMetadataIdComponentState';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { viewPickerTypeComponentState } from '@/views/view-picker/states/viewPickerTypeComponentState';
import { isDefined } from '~/utils/isDefined';

export const ViewPickerContentEffect = () => {
  const setViewPickerSelectedIcon = useSetRecoilComponentStateV2(
    viewPickerSelectedIconComponentState,
  );
  const setViewPickerInputName = useSetRecoilComponentStateV2(
    viewPickerInputNameComponentState,
  );
  const { viewPickerMode } = useViewPickerMode();

  const [viewPickerKanbanFieldMetadataId, setViewPickerKanbanFieldMetadataId] =
    useRecoilComponentStateV2(viewPickerKanbanFieldMetadataIdComponentState);

  const [viewPickerType, setViewPickerType] = useRecoilComponentStateV2(
    viewPickerTypeComponentState,
  );

  const viewPickerReferenceViewId = useRecoilComponentValueV2(
    viewPickerReferenceViewIdComponentState,
  );

  const viewPickerIsDirty = useRecoilComponentValueV2(
    viewPickerIsDirtyComponentState,
  );

  const viewPickerIsPersisting = useRecoilComponentValueV2(
    viewPickerIsPersistingComponentState,
  );

  const { viewsOnCurrentObject } = useGetCurrentView();
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
        viewPickerType === ViewType.Kanban ? 'IconLayoutKanban' : 'IconTable';
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
