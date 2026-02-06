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

type CollectNamedImportsOptions = {
  pattern: RegExp;
  namedImportsCaptureGroup: number;
  subPathCaptureGroup?: number;
};

export const collectNamedImports = (
  sourceContent: string,
  options: CollectNamedImportsOptions,
): Map<string, Set<string>> => {
  const collectedImports = new Map<string, Set<string>>();

  let importMatch;

  while (isDefined((importMatch = options.pattern.exec(sourceContent)))) {
    const namedImportsString = importMatch[options.namedImportsCaptureGroup];
    const subPath = isDefined(options.subPathCaptureGroup)
      ? (importMatch[options.subPathCaptureGroup] ?? '')
      : '';

    if (!collectedImports.has(subPath)) {
      collectedImports.set(subPath, new Set());
    }

    if (namedImportsString) {
      parseImportSpecifiers(namedImportsString).forEach((name) =>
        collectedImports.get(subPath)!.add(name),
      );
    }
  }

  options.pattern.lastIndex = 0;

  return collectedImports;
};
