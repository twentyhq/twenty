import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useGetAvailableFieldsForKanban } from '@/views/view-picker/hooks/useGetAvailableFieldsForKanban';
import { useViewPickerStates } from '@/views/view-picker/hooks/useViewPickerStates';
import { isDefined } from '~/utils/isDefined';

export const ViewPickerCreateOrEditContentEffect = () => {
  const {
    viewPickerSelectedIconState,
    viewPickerInputNameState,
    viewPickerReferenceViewIdState,
    viewPickerKanbanFieldMetadataIdState,
    viewPickerTypeState,
    viewPickerIsDirtyState,
  } = useViewPickerStates();

  const setViewPickerSelectedIcon = useSetRecoilState(
    viewPickerSelectedIconState,
  );
  const setViewPickerInputName = useSetRecoilState(viewPickerInputNameState);

  const setViewPickerKanbanFieldMetadataId = useSetRecoilState(
    viewPickerKanbanFieldMetadataIdState,
  );
  const setViewPickerType = useSetRecoilState(viewPickerTypeState);

  const viewPickerReferenceViewId = useRecoilValue(
    viewPickerReferenceViewIdState,
  );

  const viewPickerIsDirty = useRecoilValue(viewPickerIsDirtyState);
  const viewPickerSelectedIcon = useRecoilValue(viewPickerSelectedIconState);
  const viewPickerInputName = useRecoilValue(viewPickerInputNameState);
  const viewPickerKanbanFieldMetadataId = useRecoilValue(
    viewPickerKanbanFieldMetadataIdState,
  );
  const viewPickerType = useRecoilValue(viewPickerTypeState);

  const { viewsOnCurrentObject } = useGetCurrentView();
  const referenceView = viewsOnCurrentObject.find(
    (view) => view.id === viewPickerReferenceViewId,
  );

  const { availableFieldsForKanban } = useGetAvailableFieldsForKanban();

  useEffect(() => {
    if (isDefined(referenceView)) {
      if (!viewPickerSelectedIcon)
        setViewPickerSelectedIcon(referenceView.icon);
      if (!viewPickerInputName) setViewPickerInputName(referenceView.name);
      if (!viewPickerKanbanFieldMetadataId)
        setViewPickerKanbanFieldMetadataId(referenceView.kanbanFieldMetadataId);
      if (!viewPickerType) setViewPickerType(referenceView.type);
    }
  }, [
    referenceView,
    viewPickerSelectedIcon,
    viewPickerInputName,
    viewPickerKanbanFieldMetadataId,
    viewPickerType,
    setViewPickerSelectedIcon,
    setViewPickerInputName,
    setViewPickerKanbanFieldMetadataId,
    setViewPickerType,
  ]);

  useEffect(() => {
    if (availableFieldsForKanban.length > 0 && !viewPickerIsDirty) {
      setViewPickerKanbanFieldMetadataId(availableFieldsForKanban[0].id);
    }
  }, [
    availableFieldsForKanban,
    setViewPickerKanbanFieldMetadataId,
    viewPickerIsDirty,
  ]);

  return <></>;
};
