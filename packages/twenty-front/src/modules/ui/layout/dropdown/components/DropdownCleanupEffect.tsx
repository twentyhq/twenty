import { useEffect } from 'react';

import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

type DropdownCleanupEffectProps = {
  dropdownId: string;
};

export const DropdownCleanupEffect = ({
  dropdownId,
}: DropdownCleanupEffectProps) => {
  const { closeDropdown } = useCloseDropdown();

  useEffect(() => () => closeDropdown(dropdownId), [closeDropdown, dropdownId]);

  return null;
};
