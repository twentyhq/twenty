import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';

import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const useIsDropdownOpen = (
  dropdownComponentInstanceIdFromProps?: string,
) => {
  const dropdownComponentInstanceIdFromContext =
    useAvailableComponentInstanceId(DropdownComponentInstanceContext);

  const dropdownComponentInstanceId =
    dropdownComponentInstanceIdFromProps ??
    dropdownComponentInstanceIdFromContext;

  const isDropdownOpen = useRecoilComponentValueV2(
    isDropdownOpenComponentState,
    dropdownComponentInstanceId,
  );

  return {
    isDropdownOpen,
  };
};
