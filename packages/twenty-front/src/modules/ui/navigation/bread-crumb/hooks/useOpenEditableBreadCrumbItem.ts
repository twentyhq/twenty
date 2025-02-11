import { isExpandableInputOpenedComponentState } from '@/ui/input/states/isExpandableInputOpenedComponentState';
import { EditableBreadcrumbItemHotkeyScope } from '@/ui/navigation/bread-crumb/types/EditableBreadcrumbItemHotkeyScope';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilCallback } from 'recoil';

export const useOpenExpandableInput = () => {
  const setHotkeyScope = useSetHotkeyScope();

  const openExpandableInput = useRecoilCallback(
    ({ set }) =>
      (expandableInputInstanceId: string) => {
        set(
          isExpandableInputOpenedComponentState.atomFamily({
            instanceId: expandableInputInstanceId,
          }),
          true,
        );
        setHotkeyScope(
          EditableBreadcrumbItemHotkeyScope.EditableBreadcrumbItem,
        );
      },
    [setHotkeyScope],
  );

  return { openExpandableInput };
};
