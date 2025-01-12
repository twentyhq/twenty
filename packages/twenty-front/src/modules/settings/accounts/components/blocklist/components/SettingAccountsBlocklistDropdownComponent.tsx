import { StyledInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelect';
import { BLOCKLIST_SCOPE_DROPDOWN_ITEMS } from '@/settings/accounts/constants/BlocklistScopeDropdownItems';
import { BlocklistItemScope } from '@/settings/accounts/types/BlocklistItemScope';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItemMultiSelect } from 'twenty-ui';

type SettingsAccountsBlocklistDropdownComponentProps = {
  handleMultiSelectChange: (id: BlocklistItemScope) => void;
  dropdownSearchText: string;
  setDropdownSearchText: (text: string) => void;
  selectedBlocklistScopes: BlocklistItemScope[];
};

export const SettingsAccountsBlocklistDropdownComponent = ({
  handleMultiSelectChange,
  setDropdownSearchText,
  dropdownSearchText,
  selectedBlocklistScopes,
}: SettingsAccountsBlocklistDropdownComponentProps) => {
  return (
    <DropdownMenuItemsContainer>
      <StyledInput
        value={dropdownSearchText}
        autoFocus
        placeholder="Search"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setDropdownSearchText(event.target.value.toLowerCase());
        }}
      />
      {BLOCKLIST_SCOPE_DROPDOWN_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(dropdownSearchText),
      ).map((item) => (
        <MenuItemMultiSelect
          key={item.id}
          onSelectChange={() => handleMultiSelectChange(item.id)}
          text={item.label}
          selected={selectedBlocklistScopes.includes(item.id)}
          className={''}
        />
      ))}
    </DropdownMenuItemsContainer>
  );
};
