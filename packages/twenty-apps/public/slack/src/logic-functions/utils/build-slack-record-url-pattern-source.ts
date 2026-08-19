const UUID_PATTERN_SOURCE =
  '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Capture groups: 1 = object name singular, 2 = record id.
export const buildSlackRecordUrlPatternSource = (
  workspaceBaseUrl: string,
): string =>
  `${escapeRegExp(workspaceBaseUrl)}/object/([a-zA-Z][a-zA-Z0-9]*)/(${UUID_PATTERN_SOURCE})`;
