import { BlocklistItemScope } from '@/settings/accounts/types/BlocklistItemScope';

export const BLOCKLIST_SCOPE_DROPDOWN_ITEMS: {
  id: BlocklistItemScope;
  label: string;
}[] = [
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
