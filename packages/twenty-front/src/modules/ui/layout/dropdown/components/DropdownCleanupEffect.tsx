import { useStore } from 'jotai';
import { useEffect } from 'react';

import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { dropdownMountCountComponentState } from '@/ui/layout/dropdown/states/dropdownMountCountComponentState';

type DropdownCleanupEffectProps = {
  dropdownId: string;
};

export const DropdownCleanupEffect = ({
  dropdownId,
}: DropdownCleanupEffectProps) => {
  const store = useStore();
  const { closeDropdown } = useCloseDropdown();

  useEffect(() => {
    const dropdownMountCountAtom = dropdownMountCountComponentState.atomFamily({
      instanceId: dropdownId,
    });

    store.set(dropdownMountCountAtom, (mountCount) => mountCount + 1);

    return () => {
      store.set(dropdownMountCountAtom, (mountCount) => mountCount - 1);

      queueMicrotask(() => {
        const hasMountedDropdown = store.get(dropdownMountCountAtom) > 0;

        if (hasMountedDropdown) {
          return;
        }

        closeDropdown(dropdownId);
      });
    };
  }, [closeDropdown, dropdownId, store]);

  return null;
};
