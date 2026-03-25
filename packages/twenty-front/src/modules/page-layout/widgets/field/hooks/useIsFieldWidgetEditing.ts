import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsFieldWidgetEditing = () => {
  const recordFieldInstanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const focusStack = useAtomStateValue(focusStackState);

  const isEditing = focusStack.some(
    (item) =>
      item.componentInstance.componentInstanceId === recordFieldInstanceId,
  );

  return { isEditing };
};
