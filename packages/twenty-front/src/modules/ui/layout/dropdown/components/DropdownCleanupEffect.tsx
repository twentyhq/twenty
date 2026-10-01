import { atom, useStore } from 'jotai';
import { useEffect, useState } from 'react';

import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

type DropdownCleanupEffectProps = {
  dropdownId: string;
};

export const DropdownCleanupEffect = ({
  dropdownId,
}: DropdownCleanupEffectProps) => {
  const { closeDropdown } = useCloseDropdown();

  const store = useStore();
  const [mountedDropdownIdAtom] = useState(() => atom<string | null>(null));

  useEffect(() => {
    store.set(mountedDropdownIdAtom, dropdownId);

    return () => {
      store.set(mountedDropdownIdAtom, null);

      queueMicrotask(() => {
        if (store.get(mountedDropdownIdAtom) !== dropdownId) {
          closeDropdown(dropdownId);
        }
      });
    };
  }, [closeDropdown, dropdownId, mountedDropdownIdAtom, store]);

  return null;
};
