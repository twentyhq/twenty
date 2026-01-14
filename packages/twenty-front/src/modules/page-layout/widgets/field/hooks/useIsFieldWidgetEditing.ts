import { useRecoilValue } from 'recoil';

import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

export const useIsFieldWidgetEditing = () => {
  const recordFieldInstanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const focusStack = useRecoilValue(focusStackState);

  const isEditing = focusStack.some(
    (item) =>
      item.componentInstance.componentInstanceId === recordFieldInstanceId,
  );

  return { isEditing };
};
