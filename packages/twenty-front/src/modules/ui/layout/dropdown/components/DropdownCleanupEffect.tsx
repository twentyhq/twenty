import { useStore } from 'jotai';
import { useEffect } from 'react';

import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { mountedDropdownRootCountComponentState } from '@/ui/layout/dropdown/states/internal/mountedDropdownRootCountComponentState';

type DropdownCleanupEffectProps = {
  dropdownId: string;
};

export const DropdownCleanupEffect = ({
  dropdownId,
}: DropdownCleanupEffectProps) => {
  const { closeDropdown } = useCloseDropdown();
  const store = useStore();

  useEffect(() => {
    const mountedDropdownRootCountAtom =
      mountedDropdownRootCountComponentState.atomFamily({
        instanceId: dropdownId,
      });

    store.set(mountedDropdownRootCountAtom, (count) => count + 1);

    return () => {
      store.set(mountedDropdownRootCountAtom, (count) => count - 1);

      queueMicrotask(() => {
        if (store.get(mountedDropdownRootCountAtom) === 0) {
          closeDropdown(dropdownId);
        }
      });
    };
  }, [closeDropdown, dropdownId, store]);

  return null;
};
