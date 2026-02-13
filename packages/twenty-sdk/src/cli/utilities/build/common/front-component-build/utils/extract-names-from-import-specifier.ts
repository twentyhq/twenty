import { isDefined } from 'twenty-shared/utils';

import { type ParsedImportSpecifier } from '../types/ParsedImportSpecifier';

const ALIASED_IMPORT_PATTERN = /^([\w$]+)\s+as\s+([\w$]+)$/;

export const extractNamesFromImportSpecifier = (
  importSpecifier: string,
): ParsedImportSpecifier => {
  const trimmedSpecifier = importSpecifier.trim();
  const aliasMatch = trimmedSpecifier.match(ALIASED_IMPORT_PATTERN);

  if (isDefined(aliasMatch)) {
    const [, originalName, aliasName] = aliasMatch;

    return { originalName, aliasName };
  }

  return { originalName: trimmedSpecifier, aliasName: trimmedSpecifier };
};
