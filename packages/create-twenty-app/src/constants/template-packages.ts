// twenty-client-sdk, twenty-sdk and twenty-ui are released together at a single
// version, so the scaffolder pins all of them to its own version. Keep this list
// as the one source of truth: the template lockfile generator resolves exactly
// these names, and a mismatch between the two silently ships an unusable lockfile.
export const TEMPLATE_FIRST_PARTY_PACKAGES = [
  'twenty-client-sdk',
  'twenty-sdk',
  'twenty-ui',
] as const;
