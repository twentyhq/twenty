import { useRecoilCallback } from 'recoil';

import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusIdFromFocusStack } from '@/ui/utilities/focus/hooks/useRemoveFocusIdFromFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { GlobalHotkeysConfig } from '@/ui/utilities/hotkey/types/GlobalHotkeysConfig';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

export const useDropdownV2 = () => {
  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const { removeFocusIdFromFocusStack } = useRemoveFocusIdFromFocusStack();

  const closeDropdown = useRecoilCallback(
    ({ set, snapshot }) =>
      (specificComponentId: string) => {
        const scopeId = specificComponentId;

        const isDropdownOpen = snapshot
          .getLoadable(isDropdownOpenComponentState({ scopeId }))
          .getValue();

        if (isDropdownOpen) {
          removeFocusIdFromFocusStack({
            focusId: scopeId,
            memoizeKey: 'global',
          });
          goBackToPreviousDropdownFocusId();
          set(
            isDropdownOpenComponentState({
              scopeId,
            }),
            false,
          );
        }
      },
    [removeFocusIdFromFocusStack, goBackToPreviousDropdownFocusId],
  );

  const openDropdown = useRecoilCallback(
    ({ set }) =>
      (
        specificComponentId: string,
        globalHotkeysConfig?: Partial<GlobalHotkeysConfig>,
      ) => {
        const scopeId = specificComponentId;

        set(
          isDropdownOpenComponentState({
            scopeId,
          }),
          true,
        );

        pushFocusItemToFocusStack({
          focusId: scopeId,
          component: {
            type: FocusComponentType.DROPDOWN,
            instanceId: scopeId,
          },
          globalHotkeysConfig,
          // TODO: Remove this once we've fully migrated away from hotkey scopes
          hotkeyScope: { scope: 'dropdown' } as HotkeyScope,
          memoizeKey: 'global',
        });
      },
    [pushFocusItemToFocusStack],
  );

  const toggleDropdown = useRecoilCallback(
    ({ snapshot }) =>
      (
        specificComponentId: string,
        globalHotkeysConfig?: Partial<GlobalHotkeysConfig>,
      ) => {
        const scopeId = specificComponentId;
        const isDropdownOpen = snapshot
          .getLoadable(isDropdownOpenComponentState({ scopeId }))
          .getValue();

        if (isDropdownOpen) {
          closeDropdown(specificComponentId);
        } else {
          openDropdown(specificComponentId, globalHotkeysConfig);
        }
      },
    [closeDropdown, openDropdown],
  );

  return {
    closeDropdown,
    openDropdown,
    toggleDropdown,
  };
};
