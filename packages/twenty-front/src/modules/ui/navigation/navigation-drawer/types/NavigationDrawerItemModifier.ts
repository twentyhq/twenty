import { type ShortcutDefinition } from 'twenty-ui/primitives/typography';

export type NavigationDrawerItemModifier =
  | 'soon'
  | 'new'
  | { keyboard: ShortcutDefinition };
