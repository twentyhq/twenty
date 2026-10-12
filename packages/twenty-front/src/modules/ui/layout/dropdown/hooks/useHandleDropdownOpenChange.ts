import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { type GlobalHotkeysConfig } from '@/ui/utilities/hotkey/types/GlobalHotkeysConfig';

type UseHandleDropdownOpenChangeArgs = {
  dropdownId: string;
  globalHotkeysConfig?: Partial<GlobalHotkeysConfig>;
};

export const useHandleDropdownOpenChange = ({
  dropdownId,
  globalHotkeysConfig,
}: UseHandleDropdownOpenChangeArgs) => {
  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();

  const handleDropdownOpenChange = (open: boolean) => {
    if (!open) {
      closeDropdown(dropdownId);
      return;
    }

    openDropdown({
      dropdownComponentInstanceIdFromProps: dropdownId,
      globalHotkeysConfig,
    });
  };

  return { handleDropdownOpenChange };
};
