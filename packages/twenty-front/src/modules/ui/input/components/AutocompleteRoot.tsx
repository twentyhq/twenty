import { type ReactNode } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
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

type AutocompleteRootProps<TItem> = {
  children: ReactNode;
  dropdownId: string;
  items: readonly TItem[];
  value: string;
  onValueChange: (value: string) => void;
  itemToStringValue?: (item: TItem) => string;
  enabled?: boolean;
  openOnValueChange?: boolean;
  closeOnItemPress?: boolean;
  onClose?: () => void;
  onItemHighlightedByUser?: (item: TItem | undefined) => void;
  globalHotkeysConfig?: Partial<GlobalHotkeysConfig>;
};

export const AutocompleteRoot = <TItem,>({
  children,
  dropdownId,
  items,
  value,
  onValueChange,
  itemToStringValue,
  enabled = true,
  openOnValueChange = true,
  closeOnItemPress = true,
  onClose,
  onItemHighlightedByUser,
  globalHotkeysConfig,
}: AutocompleteRootProps<TItem>) => {
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();

  const handleValueChange: AutocompletePrimitiveRootProps<TItem>['onValueChange'] =
    (nextValue, details) => {
      if (details.reason === 'item-press' || details.reason === 'escape-key') {
        return;
      }

      onValueChange(nextValue);
    };

  const handleOpenChange: AutocompletePrimitiveRootProps<TItem>['onOpenChange'] =
    (open, details) => {
      const isOpeningOnValueChange =
        details.reason === 'input-change' && !openOnValueChange;
      const isOpeningEmptyList =
        details.reason === 'list-navigation' && !isNonEmptyArray(items);
      const isClosingOnItemPress =
        details.reason === 'item-press' && !closeOnItemPress;

      if (
        !enabled ||
        (open && (isOpeningOnValueChange || isOpeningEmptyList)) ||
        (!open && isClosingOnItemPress)
      ) {
        details.cancel();
        return;
      }

      if (!open) {
        closeDropdown(dropdownId);
        onClose?.();
        return;
      }

      openDropdown({
        dropdownComponentInstanceIdFromProps: dropdownId,
        globalHotkeysConfig,
      });
    };

  const handleItemHighlighted: AutocompletePrimitiveRootProps<TItem>['onItemHighlighted'] =
    (item, details) => {
      onItemHighlightedByUser?.(details.reason === 'none' ? undefined : item);
    };

  return (
    <DropdownComponentInstanceContext.Provider
      value={{ instanceId: dropdownId }}
    >
      <Autocomplete.Root<TItem>
        items={items}
        filter={null}
        autoHighlight="always"
        value={value}
        open={enabled && isDropdownOpen}
        itemToStringValue={itemToStringValue}
        onValueChange={handleValueChange}
        onOpenChange={handleOpenChange}
        onItemHighlighted={handleItemHighlighted}
      >
        <DropdownCleanupEffect dropdownId={dropdownId} />
        {children}
      </Autocomplete.Root>
    </DropdownComponentInstanceContext.Provider>
  );
};
