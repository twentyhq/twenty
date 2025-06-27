import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';

import { isDropdownOpenComponentStateV2 } from '@/ui/layout/dropdown/states/isDropdownOpenComponentStateV2';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { GlobalHotkeysConfig } from '@/ui/utilities/hotkey/types/GlobalHotkeysConfig';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

type OpenDropdownArgs = {
  dropdownComponentInstanceIdFromProps?: string;
  globalHotkeysConfig?: Partial<GlobalHotkeysConfig>;
};

export const useOpenDropdown = () => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();
  const dropdownComponentInstanceIdFromContext =
    useAvailableComponentInstanceId(DropdownComponentInstanceContext);

  const openDropdown = useRecoilCallback(
    ({ set }) =>
      (args?: OpenDropdownArgs | null | undefined) => {
        const dropdownComponentInstanceId =
          args?.dropdownComponentInstanceIdFromProps ??
          dropdownComponentInstanceIdFromContext;

        if (!isDefined(dropdownComponentInstanceId)) {
          throw new Error('Dropdown component instance ID is not defined');
        }

        set(
          isDropdownOpenComponentStateV2.atomFamily({
            instanceId: dropdownComponentInstanceId,
          }),
          true,
        );

        setActiveDropdownFocusIdAndMemorizePrevious(
          dropdownComponentInstanceId,
        );

        pushFocusItemToFocusStack({
          focusId: dropdownComponentInstanceId,
          component: {
            type: FocusComponentType.DROPDOWN,
            instanceId: dropdownComponentInstanceId,
          },
          globalHotkeysConfig: args?.globalHotkeysConfig ?? undefined,
          // TODO: Remove this once we've fully migrated away from hotkey scopes
          hotkeyScope: { scope: 'dropdown' } as HotkeyScope,
          memoizeKey: 'global',
        });
      },
    [
      pushFocusItemToFocusStack,
      setActiveDropdownFocusIdAndMemorizePrevious,
      dropdownComponentInstanceIdFromContext,
    ],
  );

  return {
    openDropdown,
  };
};
