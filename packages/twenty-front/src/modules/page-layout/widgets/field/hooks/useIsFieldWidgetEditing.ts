import { useRecoilValue } from 'recoil';

import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';

export const useIsFieldWidgetEditing = ({
  instanceId,
}: {
  instanceId: string;
}) => {
  const focusStack = useRecoilValue(focusStackState);

  // The focusId pushed to the stack starts with instanceId.
  // For nested dropdowns (e.g., Links field sub-dropdowns), the focusId
  // will have additional suffixes, so we use startsWith to catch all of them.
  const isEditing = focusStack.some((item) =>
    item.focusId.startsWith(instanceId),
  );

  return { isEditing };
};
