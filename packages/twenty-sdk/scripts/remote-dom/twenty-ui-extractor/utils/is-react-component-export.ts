import { type ExportSpecifier } from 'ts-morph';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { typeSymbolMatchesAnyName } from './type-symbol-matches-any-name';

const REACT_RETURN_TYPE_NAMES = new Set([
  'ReactNode',
  'ReactElement',
  'Element',
]);

export const isReactComponentExport = (
  namedExport: ExportSpecifier,
): boolean => {
  const exportType = namedExport.getNameNode().getType();
  const callSignatures = exportType.getCallSignatures();

  if (!isNonEmptyArray(callSignatures)) {
    return false;
  }

  return callSignatures.some((signature) =>
    typeSymbolMatchesAnyName(
      signature.getReturnType(),
      REACT_RETURN_TYPE_NAMES,
    ),
  );
};
