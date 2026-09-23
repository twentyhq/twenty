import { type ComponentProps, useId, useState } from 'react';
import { Dropdown } from 'twenty-ui/components';

import { DropdownRootContext } from '@/ui/layout/dropdown/contexts/DropdownRootContext';
import { DropdownFocusCleanupEffect } from '@/ui/utilities/focus/components/DropdownFocusCleanupEffect';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

type DropdownRootProps = Pick<
  ComponentProps<typeof Dropdown.Root>,
  'children' | 'kind' | 'multiple' | 'defaultPage' | 'onOpenChange'
>;

export const DropdownRoot = ({
  children,
  kind,
  multiple,
  defaultPage,
  onOpenChange,
}: DropdownRootProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const focusId = useId();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const openDropdown = () => {
    setIsOpen(true);
    pushFocusItemToFocusStack({
      focusId,
      component: { type: FocusComponentType.DROPDOWN, instanceId: focusId },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
        enableGlobalHotkeysWithModifiers: false,
      },
    });
    onOpenChange?.(true);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    removeFocusItemFromFocusStackById({ focusId });
    onOpenChange?.(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeDropdown();
      return;
    }

    openDropdown();
  };

  return (
    <DropdownRootContext.Provider value={{ isOpen, closeDropdown }}>
      <Dropdown.Root
        kind={kind}
        multiple={multiple}
        defaultPage={defaultPage}
        open={isOpen}
        onOpenChange={handleOpenChange}
      >
        <DropdownFocusCleanupEffect focusId={focusId} />
        {children}
      </Dropdown.Root>
    </DropdownRootContext.Provider>
  );
};
