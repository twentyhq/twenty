import { useRecoilCallback } from 'recoil';

import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStack } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { GlobalHotkeysConfig } from '@/ui/utilities/hotkey/types/GlobalHotkeysConfig';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

export const useDropdownV2 = () => {
  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const { removeFocusItemFromFocusStack } = useRemoveFocusItemFromFocusStack();

  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();

  const closeDropdown = useRecoilCallback(
    ({ set, snapshot }) =>
      (specificComponentId: string) => {
        const scopeId = specificComponentId;

        const isDropdownOpen = snapshot
          .getLoadable(isDropdownOpenComponentState({ scopeId }))
          .getValue();

        if (isDropdownOpen) {
          removeFocusItemFromFocusStack({
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
    [removeFocusItemFromFocusStack, goBackToPreviousDropdownFocusId],
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

        setActiveDropdownFocusIdAndMemorizePrevious(specificComponentId);

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
    [pushFocusItemToFocusStack, setActiveDropdownFocusIdAndMemorizePrevious],
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
