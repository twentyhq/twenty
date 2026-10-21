import { type MessageDescriptor } from '@lingui/core';
import { type ShortcutDefinition } from 'twenty-ui/primitives/typography';

export type Shortcut = {
  label: MessageDescriptor;
  shortcuts: readonly ShortcutDefinition[];
};
