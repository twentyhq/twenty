// Pinned to the scaffolder's own version; the template lockfile generator resolves exactly these names,
// so a mismatch silently ships an unusable lockfile.
export const TEMPLATE_FIRST_PARTY_PACKAGES = [
  'twenty-client-sdk',
  'twenty-sdk',
  'twenty-ui',
] as const;
