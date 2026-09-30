import { useEffect } from 'react';

import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';

type ShareRecordDropdownOpenEffectProps = {
  dropdownId: string;
};

export const ShareRecordDropdownOpenEffect = ({
  dropdownId,
}: ShareRecordDropdownOpenEffectProps) => {
  const { openDropdown } = useOpenDropdown();

  useEffect(() => {
    openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
  }, [dropdownId, openDropdown]);

  return null;
};
