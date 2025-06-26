import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentStateV2 } from '@/ui/layout/dropdown/states/isDropdownOpenComponentStateV2';
import { GlobalHotkeysConfig } from '@/ui/utilities/hotkey/types/GlobalHotkeysConfig';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useToggleDropdown = () => {
  const dropdownComponentInstanceIdFromContext =
    useAvailableComponentInstanceId(DropdownComponentInstanceContext);

  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();

  const toggleDropdown = useRecoilCallback(
    ({ snapshot }) =>
      ({
        dropdownComponentInstanceIdFromProps,
        globalHotkeysConfig,
      }: {
        dropdownComponentInstanceIdFromProps?: string;
        globalHotkeysConfig?: Partial<GlobalHotkeysConfig>;
      }) => {
        const dropdownComponentInstanceId =
          dropdownComponentInstanceIdFromProps ??
          dropdownComponentInstanceIdFromContext;

        if (!isDefined(dropdownComponentInstanceId)) {
          throw new Error('Dropdown component instance ID is not defined');
        }

        const isDropdownOpen = snapshot
          .getLoadable(
            isDropdownOpenComponentStateV2.atomFamily({
              instanceId: dropdownComponentInstanceId,
            }),
          )
          .getValue();

        if (isDropdownOpen) {
          closeDropdown(dropdownComponentInstanceId);
        } else {
          openDropdown({
            dropdownComponentInstanceIdFromProps: dropdownComponentInstanceId,
            globalHotkeysConfig,
          });
        }
      },
    [closeDropdown, openDropdown, dropdownComponentInstanceIdFromContext],
  );

  return {
    toggleDropdown,
  };
};
