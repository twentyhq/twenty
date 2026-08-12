const escapeRegExpToken = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const buildModuleImportContextPattern = (specifier: string): RegExp =>
  new RegExp(
    `(\\bfrom\\s*|\\bimport\\s*\\(\\s*|\\bimport\\s*)(["'])${escapeRegExpToken(specifier)}\\2`,
    'g',
  );
