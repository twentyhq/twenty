import { AppFocus } from '@/app-focus/types/AppFocus';

import { HotkeysScope } from '../types/HotkeysScope';

export const ALWAYS_ON_HOTKEYS_SCOPES: HotkeysScope[] = ['command-k'];

const ALL_HOTKEYS_SCOPES_DICTIONARY: { [hotkeysScope in HotkeysScope]: true } =
  {
    'command-k': true,
    'comment-thread-relation-picker': true,
    goto: true,
    kanban: true,
    'left-bar': true,
    table: true,
    'table-body': true,
    'table-cell': true,
    'comment-drawer': true,
    'table-filter-dropdown': true,
    'table-header': true,
  };

export const ALL_HOTKEYS_SCOPES: HotkeysScope[] = Object.keys(
  ALL_HOTKEYS_SCOPES_DICTIONARY,
) as HotkeysScope[];

export const HOTKEYS_SCOPES_NOT_ALWAYS_ON = ALL_HOTKEYS_SCOPES.filter(
  (hotkeysScope) => !ALWAYS_ON_HOTKEYS_SCOPES.includes(hotkeysScope),
);

export const APP_FOCUS_TO_HOTKEYS_SCOPES: {
  [appFocusKey in AppFocus]: HotkeysScope[];
} = {
  none: ['goto', 'command-k'],
  'comment-thread-relation-picker': ['comment-thread-relation-picker'],
  'table-filter-dropdown': ['table-filter-dropdown'],
  'kanban-body': ['kanban'],
  'table-page': ['table-header', 'table', 'goto'],
  'table-body': ['table-body'],
  'table-cell': ['table-cell'],
  'comment-drawer': ['comment-drawer'],
  'kanban-page': ['kanban'],
  'left-bar': ['left-bar'],
  'command-menu': ['command-k'],
};

export const INITIAL_HOTKEYS_SCOPES: HotkeysScope[] =
  APP_FOCUS_TO_HOTKEYS_SCOPES['none'];
