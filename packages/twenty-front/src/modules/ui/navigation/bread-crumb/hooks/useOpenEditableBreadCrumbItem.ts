import { isUpdatingRecordEditableNameState } from '@/object-record/states/isUpdatingRecordEditableName';
import { EditableBreadcrumbItemHotkeyScope } from '@/ui/navigation/bread-crumb/types/EditableBreadcrumbItemHotkeyScope';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useSetRecoilState } from 'recoil';

export const useOpenEditableBreadCrumbItem = () => {
  const setIsUpdatingRecordEditableName = useSetRecoilState(
    isUpdatingRecordEditableNameState,
  );

  const setHotkeyScope = useSetHotkeyScope();

  const openEditableBreadCrumbItem = () => {
    setIsUpdatingRecordEditableName(true);
    setHotkeyScope(EditableBreadcrumbItemHotkeyScope.EditableBreadcrumbItem);
  };

  return { openEditableBreadCrumbItem };
};
