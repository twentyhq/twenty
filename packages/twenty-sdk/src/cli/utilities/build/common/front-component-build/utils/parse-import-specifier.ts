import { type ParsedImportSpecifier } from '../types/ParsedImportSpecifier';

export const parseImportSpecifier = (
  importSpecifier: string,
): ParsedImportSpecifier => {
  const trimmedSpecifier = importSpecifier.trim();
  const aliasMatch = trimmedSpecifier.match(/^(\w+)\s+as\s+(\w+)$/);

  if (aliasMatch) {
    return { originalName: aliasMatch[1], aliasName: aliasMatch[2] };
  }

  return { originalName: trimmedSpecifier, aliasName: trimmedSpecifier };
};
