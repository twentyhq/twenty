const escapeRegExpToken = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Matches an SDK client specifier only in a module-source position, i.e.
// `from '<specifier>'`, `import('<specifier>')` or `import '<specifier>'`.
// The closing quote is anchored with a backreference so a longer sibling
// specifier (e.g. `twenty-client-sdk/core-extra`) never matches, and plain
// mentions inside strings or comments (no import/from keyword) are ignored.
// Sharing this builder keeps the host-side "should I fetch the SDK?" check
// (containsSdkClientImportSpecifier) aligned with what the worker rewriter
// actually rewrites.
export const buildSdkClientImportContextPattern = (specifier: string): RegExp =>
  new RegExp(
    `(\\bfrom\\s*|\\bimport\\s*\\(\\s*|\\bimport\\s*)(["'])${escapeRegExpToken(specifier)}\\2`,
    'g',
  );
