import { msg, type MacroMessageDescriptor } from '@lingui/core/macro';

// Translation map for standard page layout tab titles.
// When the backend hasn't translated the tab title (e.g. when using
// frontend fallback layouts), this map is used to translate known
// standard tab titles at the rendering point.
// Custom/user-created tab titles that are not in this map will be
// displayed as-is.
export const STANDARD_PAGE_LAYOUT_TAB_TITLE_TRANSLATIONS: Record<
  string,
  MacroMessageDescriptor
> = {
  Home: msg`Home`,
  Timeline: msg`Timeline`,
  Tasks: msg`Tasks`,
  Notes: msg`Notes`,
  Files: msg`Files`,
  Emails: msg`Emails`,
  Calendar: msg`Calendar`,
  Note: msg`Note`,
  Flow: msg`Flow`,
};
