import { type ShortcutDefinition } from 'twenty-ui/primitives/typography';

export type Shortcut = {
  label: string;
  shortcuts: readonly ShortcutDefinition[];
};
