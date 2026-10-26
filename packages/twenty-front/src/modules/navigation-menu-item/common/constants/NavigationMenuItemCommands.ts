import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type NavigationMenuItemCommandKey } from 'twenty-shared/types';
import {
  type IconComponent,
  IconCommand,
  IconLego,
  IconMessageCirclePlus,
  IconSearch,
  IconSettings,
} from 'twenty-ui/icon';
import { type ShortcutDefinition } from 'twenty-ui/primitives/typography';

export const NAVIGATION_MENU_ITEM_COMMANDS: Record<
  NavigationMenuItemCommandKey,
  {
    label: MessageDescriptor;
    Icon: IconComponent;
    shortcut?: ShortcutDefinition;
  }
> = {
  NEW_CHAT: { label: msg`New chat`, Icon: IconMessageCirclePlus },
  SEARCH: { label: msg`Search`, Icon: IconSearch, shortcut: ['/'] },
  NEW_AGENT: { label: msg`New agent`, Icon: IconLego },
  SETTINGS: { label: msg`Settings`, Icon: IconSettings },
  ALL_COMMANDS: {
    label: msg`All commands`,
    Icon: IconCommand,
    shortcut: ['Mod', 'K'],
  },
};
