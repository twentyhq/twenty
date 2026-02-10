import { isDefined } from 'twenty-shared/utils';

import { extractNamesFromImportSpecifier } from './extract-names-from-import-specifier';

const parseImportSpecifiers = (namedImportsString: string): string[] => {
  return namedImportsString
    .split(',')
    .map((specifier) => specifier.trim())
    .filter((specifier) => specifier.length > 0)
    .filter((specifier) => !specifier.startsWith('type '))
    .map(
      (specifier) => extractNamesFromImportSpecifier(specifier).originalName,
    );
};

export const collectNamedImports = ({
  sourceContent,
  pattern,
}: {
  sourceContent: string;
  pattern: RegExp;
}): Map<string, Set<string>> => {
  const collectedImports = new Map<string, Set<string>>();

  let importMatch;

  while (isDefined((importMatch = pattern.exec(sourceContent)))) {
    const namedImportsString = importMatch.groups?.namedImports;
    const subPath = importMatch.groups?.subPath ?? '';

    if (!collectedImports.has(subPath)) {
      collectedImports.set(subPath, new Set());
    }

    if (namedImportsString) {
      parseImportSpecifiers(namedImportsString).forEach((name) =>
        collectedImports.get(subPath)?.add(name),
      );
    }
  }

  pattern.lastIndex = 0;

  return collectedImports;
};
