import { useEffect, useRef } from 'react';

import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

type DropdownCleanupEffectProps = {
  dropdownId: string;
};

export const DropdownCleanupEffect = ({
  dropdownId,
}: DropdownCleanupEffectProps) => {
  const { closeDropdown } = useCloseDropdown();

  const mountedDropdownIdRef = useRef<string | null>(null);

  useEffect(() => {
    mountedDropdownIdRef.current = dropdownId;

    return () => {
      mountedDropdownIdRef.current = null;

      queueMicrotask(() => {
        if (mountedDropdownIdRef.current !== dropdownId) {
          closeDropdown(dropdownId);
        }
      });
    };
  }, [closeDropdown, dropdownId]);

  return null;
};
