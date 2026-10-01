import { createElement } from 'react';
import {
  type AutocompleteRootProps as AutocompletePrimitiveRootProps,
  Autocomplete,
} from 'twenty-ui/primitives/input';

import { DropdownCleanupEffect } from '@/ui/layout/dropdown/components/DropdownCleanupEffect';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { type GlobalHotkeysConfig } from '@/ui/utilities/hotkey/types/GlobalHotkeysConfig';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type AutocompletePrimitiveProps<TItem> = Omit<
  AutocompletePrimitiveRootProps<TItem>,
  'items'
> & {
  items?: readonly TItem[];
};

type AutocompleteRootProps<TItem> = Omit<
  AutocompletePrimitiveProps<TItem>,
  'open' | 'defaultOpen'
> & {
  dropdownId: string;
  enabled?: boolean;
  globalHotkeysConfig?: Partial<GlobalHotkeysConfig>;
};

export const AutocompleteRoot = <TItem,>({
  children,
  dropdownId,
  enabled = true,
  globalHotkeysConfig,
  onOpenChange,
  ...props
}: AutocompleteRootProps<TItem>) => {
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();

  const handleOpenChange: NonNullable<
    AutocompletePrimitiveRootProps<TItem>['onOpenChange']
  > = (open, details) => {
    if (!enabled) {
      details.cancel();
      return;
    }

    onOpenChange?.(open, details);

    if (details.isCanceled) {
      return;
    }

    if (!open) {
      closeDropdown(dropdownId);
      return;
    }

    if (isDropdownOpen) {
      return;
    }

    openDropdown({
      dropdownComponentInstanceIdFromProps: dropdownId,
      globalHotkeysConfig,
    });
  };

  return (
    <DropdownComponentInstanceContext.Provider
      value={{ instanceId: dropdownId }}
    >
      {createElement<AutocompletePrimitiveProps<TItem>>(
        Autocomplete.Root,
        {
          ...props,
          open: enabled && isDropdownOpen,
          onOpenChange: handleOpenChange,
        },
        <DropdownCleanupEffect dropdownId={dropdownId} />,
        children,
      )}
    </DropdownComponentInstanceContext.Provider>
  );
};
