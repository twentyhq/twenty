import { useCallback } from 'react';

import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { type GlobalHotkeysConfig } from '@/ui/utilities/hotkey/types/GlobalHotkeysConfig';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

type ToggleDropdownArgs = {
  dropdownComponentInstanceIdFromProps?: string;
  globalHotkeysConfig?: Partial<GlobalHotkeysConfig>;
};

export const useToggleDropdown = () => {
  const dropdownComponentInstanceIdFromContext =
    useAvailableComponentInstanceId(DropdownComponentInstanceContext);

  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();

  const store = useStore();

  const toggleDropdown = useCallback(
    (args?: ToggleDropdownArgs | null | undefined) => {
      const dropdownComponentInstanceId =
        args?.dropdownComponentInstanceIdFromProps ??
        dropdownComponentInstanceIdFromContext;

      if (!isDefined(dropdownComponentInstanceId)) {
        throw new Error('Dropdown component instance ID is not defined');
      }

      const isDropdownOpen = store.get(
        isDropdownOpenComponentState.atomFamily({
          instanceId: dropdownComponentInstanceId,
        }),
      );

      if (isDropdownOpen) {
        closeDropdown(dropdownComponentInstanceId);
      } else {
        openDropdown({
          dropdownComponentInstanceIdFromProps: dropdownComponentInstanceId,
          globalHotkeysConfig: args?.globalHotkeysConfig,
        });
      }
    },
    [
      closeDropdown,
      openDropdown,
      dropdownComponentInstanceIdFromContext,
      store,
    ],
  );

  return {
    toggleDropdown,
  };
};
