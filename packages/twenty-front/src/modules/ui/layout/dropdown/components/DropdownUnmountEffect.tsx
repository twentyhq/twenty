import { useDropdownV2 } from '@/ui/layout/dropdown/hooks/useDropdownV2';
import { useEffect } from 'react';

export const DropdownUnmountEffect = ({
  dropdownId,
}: {
  dropdownId: string;
}) => {
  const { closeDropdown } = useDropdownV2();

  useEffect(() => {
    return () => {
      closeDropdown(dropdownId);
    };
  }, [closeDropdown, dropdownId]);

  return null;
};
