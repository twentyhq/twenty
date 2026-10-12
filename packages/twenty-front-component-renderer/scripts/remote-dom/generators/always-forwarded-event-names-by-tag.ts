export const ALWAYS_FORWARDED_EVENT_NAMES_BY_TAG: Readonly<
  Record<string, readonly string[]>
> = {
  'html-input': ['change'],
  'html-textarea': ['change'],
  'html-select': ['change'],
};
