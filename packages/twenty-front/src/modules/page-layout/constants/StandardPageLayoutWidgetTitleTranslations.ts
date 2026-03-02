import { msg, type MacroMessageDescriptor } from '@lingui/core/macro';

// Translation map for standard page layout widget titles.
// When the backend hasn't translated the widget title (e.g. when using
// frontend fallback layouts), this map is used to translate known
// standard widget titles at the rendering point.
// Custom/user-created widget titles that are not in this map will be
// displayed as-is.
// TODO: drop once the configuration of all record page layouts has been migrated to the backend.
export const STANDARD_PAGE_LAYOUT_WIDGET_TITLE_TRANSLATIONS: Record<
  string,
  MacroMessageDescriptor
> = {
  Fields: msg`Fields`,
  Timeline: msg`Timeline`,
  Tasks: msg`Tasks`,
  Notes: msg`Notes`,
  Files: msg`Files`,
  Emails: msg`Emails`,
  Calendar: msg`Calendar`,
  Note: msg`Note`,
  Task: msg`Task`,
  Flow: msg`Flow`,
};
