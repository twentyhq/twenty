import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRecoilCallback } from 'recoil';

export const useCloseDropdownFromOutside = () => {
  const closeDropdownFromOutside = useRecoilCallback(
    ({ set }) =>
      (dropdownId: string) => {
        set(isDropdownOpenComponentState({ scopeId: dropdownId }), false);
      },
    [],
  );

  return { closeDropdownFromOutside };
};
