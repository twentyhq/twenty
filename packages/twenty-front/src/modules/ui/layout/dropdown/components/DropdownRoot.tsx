import { useStore } from 'jotai';
import { type ComponentProps, useCallback, useSyncExternalStore } from 'react';
import { Dropdown } from 'twenty-ui/components';

import { DropdownCleanupEffect } from '@/ui/layout/dropdown/components/DropdownCleanupEffect';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useHandleDropdownOpenChange } from '@/ui/layout/dropdown/hooks/useHandleDropdownOpenChange';
import { type GlobalHotkeysConfig } from '@/ui/utilities/hotkey/types/GlobalHotkeysConfig';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';

type DropdownRootProps = Pick<
  ComponentProps<typeof Dropdown.Root>,
  | 'children'
  | 'type'
  | 'multiple'
  | 'defaultPage'
  | 'onOpenChange'
  | 'onEscapeKeyDown'
  | 'onInteractOutside'
> & {
  dropdownId: string;
  globalHotkeysConfig?: Partial<GlobalHotkeysConfig>;
};

export const DropdownRoot = ({
  children,
  type,
  multiple,
  defaultPage,
  dropdownId,
  globalHotkeysConfig,
  onOpenChange,
  onEscapeKeyDown,
  onInteractOutside,
}: DropdownRootProps) => {
  const store = useStore();
  const dropdownOpenState = isDropdownOpenComponentState.atomFamily({
    instanceId: dropdownId,
  });
  const subscribeToDropdownOpenState = useCallback(
    (onStoreChange: () => void) => {
      return store.sub(dropdownOpenState, () => {
        const open = store.get(dropdownOpenState);

        onStoreChange();
        onOpenChange?.(open);
      });
    },
    [dropdownOpenState, onOpenChange, store],
  );
  const getIsDropdownOpen = () => store.get(dropdownOpenState);
  const isDropdownOpen = useSyncExternalStore(
    subscribeToDropdownOpenState,
    getIsDropdownOpen,
    getIsDropdownOpen,
  );
  const { handleDropdownOpenChange } = useHandleDropdownOpenChange({
    dropdownId,
    globalHotkeysConfig,
  });

  return (
    <DropdownComponentInstanceContext.Provider
      value={{ instanceId: dropdownId }}
    >
      <Dropdown.Root
        type={type}
        multiple={multiple}
        defaultPage={defaultPage}
        open={isDropdownOpen}
        onOpenChange={handleDropdownOpenChange}
        onEscapeKeyDown={onEscapeKeyDown}
        onInteractOutside={onInteractOutside}
      >
        <DropdownCleanupEffect dropdownId={dropdownId} />
        {children}
      </Dropdown.Root>
    </DropdownComponentInstanceContext.Provider>
  );
};
