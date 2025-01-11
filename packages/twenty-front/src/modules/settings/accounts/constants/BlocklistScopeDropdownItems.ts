import { BlocklistItemScope } from '@/settings/accounts/types/BlocklistItemScope';

type BlocklistScopeDropdownItem = {
  id: BlocklistItemScope;
  label: string;
};

export const BLOCKLIST_SCOPE_DROPDOWN_ITEMS: BlocklistScopeDropdownItem[] = [
  {
    id: BlocklistItemScope.FROM_TO,
    label: 'From/To',
  },
  {
    id: BlocklistItemScope.CC,
    label: 'Cc',
  },
  {
    id: BlocklistItemScope.BCC,
    label: 'Bcc',
  },
];
