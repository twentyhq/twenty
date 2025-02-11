import { isExpandableInputOpenedComponentState } from '@/ui/input/states/isExpandableInputOpenedComponentState';
import { EditableBreadcrumbItemHotkeyScope } from '@/ui/navigation/bread-crumb/types/EditableBreadcrumbItemHotkeyScope';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

export const useOpenEditableBreadCrumbItem = () => {
  // TODO: modify this
  const expandableInputInstanceId = 'expandable-input-instance-id';

  const setIsUpdatingRecordEditableName = useSetRecoilComponentStateV2(
    isExpandableInputOpenedComponentState,
    expandableInputInstanceId,
  );

  const setHotkeyScope = useSetHotkeyScope();

  const openEditableBreadCrumbItem = () => {
    setIsUpdatingRecordEditableName(true);
    setHotkeyScope(EditableBreadcrumbItemHotkeyScope.EditableBreadcrumbItem);
  };

  return { openEditableBreadCrumbItem };
};
