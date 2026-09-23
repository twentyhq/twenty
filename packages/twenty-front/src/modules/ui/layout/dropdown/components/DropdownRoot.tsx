import { type ComponentProps } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';

import { DropdownCleanupEffect } from '@/ui/layout/dropdown/components/DropdownCleanupEffect';
import { DropdownOnToggleEffect } from '@/ui/layout/dropdown/components/DropdownOnToggleEffect';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type DropdownRootProps = Pick<
  ComponentProps<typeof Dropdown.Root>,
  'children' | 'type' | 'multiple' | 'defaultPage' | 'onOpenChange'
> & {
  dropdownId: string;
};

export const DropdownRoot = ({
  children,
  type,
  multiple,
  defaultPage,
  dropdownId,
  onOpenChange,
}: DropdownRootProps) => {
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeDropdown(dropdownId);
      return;
    }

    openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
  };

  return (
    <DropdownComponentInstanceContext.Provider
      value={{ instanceId: dropdownId }}
    >
      <Dropdown.Root
        type={type}
        multiple={multiple}
        defaultPage={defaultPage}
        open={isDropdownOpen}
        onOpenChange={handleOpenChange}
      >
        <DropdownCleanupEffect dropdownId={dropdownId} />
        {isDefined(onOpenChange) && (
          <DropdownOnToggleEffect
            onDropdownOpen={() => onOpenChange(true)}
            onDropdownClose={() => onOpenChange(false)}
          />
        )}
        {children}
      </Dropdown.Root>
    </DropdownComponentInstanceContext.Provider>
  );
};
