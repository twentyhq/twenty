import { useEffect } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useGetAvailableFieldsForKanban } from '@/views/view-picker/hooks/useGetAvailableFieldsForKanban';
import { useViewPickerStates } from '@/views/view-picker/hooks/useViewPickerStates';
import { isDefined } from '~/utils/isDefined';

export const ViewPickerCreateOrEditContentEffect = () => {
  const {
    viewPickerSelectedIconState,
    viewPickerInputNameState,
    viewPickerReferenceViewIdState,
    viewPickerIsPersistingState,
    viewPickerKanbanFieldMetadataIdState,
    viewPickerTypeState,
    viewPickerIsDirtyState,
  } = useViewPickerStates();

  const setViewPickerSelectedIcon = useSetRecoilState(
    viewPickerSelectedIconState,
  );
  const setViewPickerInputName = useSetRecoilState(viewPickerInputNameState);

  const [viewPickerKanbanFieldMetadataId, setViewPickerKanbanFieldMetadataId] =
    useRecoilState(viewPickerKanbanFieldMetadataIdState);
  const setViewPickerType = useSetRecoilState(viewPickerTypeState);

  const viewPickerReferenceViewId = useRecoilValue(
    viewPickerReferenceViewIdState,
  );

  const viewPickerIsDirty = useRecoilValue(viewPickerIsDirtyState);

  const viewPickerIsPersisting = useRecoilValue(viewPickerIsPersistingState);

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
