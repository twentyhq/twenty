import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useIsFieldWidgetEditing = () => {
  const recordFieldInstanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const focusStack = useRecoilValueV2(focusStackState);

  const isEditing = focusStack.some(
    (item) =>
      item.componentInstance.componentInstanceId === recordFieldInstanceId,
  );

  return { isEditing };
};
