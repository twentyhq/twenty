import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponeInstanceContext';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { isDropdownOpenComponentStateV2 } from '@/ui/layout/dropdown/states/isDropdownOpenComponentStateV2';
import { useRemoveFocusItemFromFocusStack } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStack';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useCloseDropdown = () => {
  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const { removeFocusItemFromFocusStack } = useRemoveFocusItemFromFocusStack();

  const dropdownComponentInstanceIdFromContext =
    useAvailableComponentInstanceId(DropdownComponentInstanceContext);

  const closeDropdown = useRecoilCallback(
    ({ set, snapshot }) =>
      (dropdownComponentInstanceIdFromProps?: string) => {
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

        const isDropdownOpenLegacy = snapshot
          .getLoadable(
            isDropdownOpenComponentState({
              scopeId: dropdownComponentInstanceId,
            }),
          )
          .getValue();

        if (isDropdownOpen || isDropdownOpenLegacy) {
          removeFocusItemFromFocusStack({
            focusId: dropdownComponentInstanceId,
            memoizeKey: 'global',
          });

          goBackToPreviousDropdownFocusId();

          set(
            isDropdownOpenComponentStateV2.atomFamily({
              instanceId: dropdownComponentInstanceId,
            }),
            false,
          );

          set(
            isDropdownOpenComponentState({
              scopeId: dropdownComponentInstanceId,
            }),
            false,
          );
        }
      },
    [
      removeFocusItemFromFocusStack,
      goBackToPreviousDropdownFocusId,
      dropdownComponentInstanceIdFromContext,
    ],
  );

  return {
    closeDropdown,
  };
};
