import { useCallback } from 'react';

import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';

import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { type GlobalHotkeysConfig } from '@/ui/utilities/hotkey/types/GlobalHotkeysConfig';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

type OpenDropdownArgs = {
  dropdownComponentInstanceIdFromProps?: string;
  globalHotkeysConfig?: Partial<GlobalHotkeysConfig>;
};

export const useOpenDropdown = () => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();
  const store = useStore();

  const dropdownComponentInstanceIdFromContext =
    useAvailableComponentInstanceId(DropdownComponentInstanceContext);

  const openDropdown = useCallback(
    (args?: OpenDropdownArgs | null | undefined) => {
      const dropdownComponentInstanceId =
        args?.dropdownComponentInstanceIdFromProps ??
        dropdownComponentInstanceIdFromContext;

      if (!isDefined(dropdownComponentInstanceId)) {
        throw new Error('Dropdown component instance ID is not defined');
      }

      store.set(
        isDropdownOpenComponentState.atomFamily({
          instanceId: dropdownComponentInstanceId,
        }),
        true,
      );

      setActiveDropdownFocusIdAndMemorizePrevious(dropdownComponentInstanceId);

      pushFocusItemToFocusStack({
        focusId: dropdownComponentInstanceId,
        component: {
          type: FocusComponentType.DROPDOWN,
          instanceId: dropdownComponentInstanceId,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysConflictingWithKeyboard:
            args?.globalHotkeysConfig
              ?.enableGlobalHotkeysConflictingWithKeyboard ?? false,
          enableGlobalHotkeysWithModifiers:
            args?.globalHotkeysConfig?.enableGlobalHotkeysWithModifiers ??
            false,
        },
      });
    },
    [
      pushFocusItemToFocusStack,
      setActiveDropdownFocusIdAndMemorizePrevious,
      dropdownComponentInstanceIdFromContext,
      store,
    ],
  );

  return {
    openDropdown,
  };
};
