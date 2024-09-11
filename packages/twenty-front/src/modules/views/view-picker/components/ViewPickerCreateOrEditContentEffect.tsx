import { useEffect } from 'react';

import { useRecoilComponentValueV2 } from '@/ui/utilities/state/instance/hooks/useRecoilComponentValueV2';
import { useRecoilInstanceState } from '@/ui/utilities/state/instance/hooks/useRecoilInstanceState';
import { useSetRecoilInstanceState } from '@/ui/utilities/state/instance/hooks/useSetRecoilInstanceState';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useGetAvailableFieldsForKanban } from '@/views/view-picker/hooks/useGetAvailableFieldsForKanban';
import { viewPickerInputNameInstanceState } from '@/views/view-picker/states/viewPickerInputNameInstanceState';
import { viewPickerIsDirtyInstanceState } from '@/views/view-picker/states/viewPickerIsDirtyInstanceState';
import { viewPickerIsPersistingInstanceState } from '@/views/view-picker/states/viewPickerIsPersistingInstanceState';
import { viewPickerKanbanFieldMetadataIdInstanceState } from '@/views/view-picker/states/viewPickerKanbanFieldMetadataIdInstanceState';
import { viewPickerReferenceViewIdInstanceState } from '@/views/view-picker/states/viewPickerReferenceViewIdInstanceState';
import { viewPickerSelectedIconInstanceState } from '@/views/view-picker/states/viewPickerSelectedIconInstanceState';
import { viewPickerTypeInstanceState } from '@/views/view-picker/states/viewPickerTypeInstanceState';
import { isDefined } from '~/utils/isDefined';

export const ViewPickerCreateOrEditContentEffect = () => {
  const setViewPickerSelectedIcon = useSetRecoilInstanceState(
    viewPickerSelectedIconInstanceState,
  );
  const setViewPickerInputName = useSetRecoilInstanceState(
    viewPickerInputNameInstanceState,
  );

  const [viewPickerKanbanFieldMetadataId, setViewPickerKanbanFieldMetadataId] =
    useRecoilInstanceState(viewPickerKanbanFieldMetadataIdInstanceState);

  const setViewPickerType = useSetRecoilInstanceState(
    viewPickerTypeInstanceState,
  );

  const viewPickerReferenceViewId = useRecoilComponentValueV2(
    viewPickerReferenceViewIdInstanceState,
  );

  const viewPickerIsDirty = useRecoilComponentValueV2(
    viewPickerIsDirtyInstanceState,
  );

  const viewPickerIsPersisting = useRecoilComponentValueV2(
    viewPickerIsPersistingInstanceState,
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
      setViewPickerSelectedIcon(referenceView.icon);
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
