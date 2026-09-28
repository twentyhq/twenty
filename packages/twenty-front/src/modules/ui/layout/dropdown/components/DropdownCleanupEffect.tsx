import { useEffect, useRef } from 'react';

import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

type DropdownCleanupEffectProps = {
  dropdownId: string;
};

export const DropdownCleanupEffect = ({
  dropdownId,
}: DropdownCleanupEffectProps) => {
  const { closeDropdown } = useCloseDropdown();
  // oxlint-disable-next-line twenty/no-state-useref
  const mountedDropdownIdRef = useRef<string>(undefined);

  useEffect(() => {
    mountedDropdownIdRef.current = dropdownId;

    return () => {
      mountedDropdownIdRef.current = undefined;

      queueMicrotask(() => {
        const isRemounted = mountedDropdownIdRef.current === dropdownId;

        if (!isRemounted) {
          closeDropdown(dropdownId);
        }
      });
    };
  }, [closeDropdown, dropdownId]);

  return null;
};
