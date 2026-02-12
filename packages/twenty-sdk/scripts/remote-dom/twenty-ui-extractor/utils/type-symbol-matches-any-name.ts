import { type Type } from 'ts-morph';

import { isDefined } from 'twenty-shared/utils';

const getTypeSymbolName = (type: Type): string | undefined => {
  return (type.getSymbol() ?? type.getAliasSymbol())?.getName();
};

export const typeSymbolMatchesAnyName = (
  type: Type,
  names: Set<string>,
): boolean => {
  const symbolName = getTypeSymbolName(type);

  if (isDefined(symbolName) && names.has(symbolName)) {
    return true;
  }

  if (type.isUnion()) {
    return type
      .getUnionTypes()
      .filter((memberType) => !memberType.isUndefined() && !memberType.isNull())
      .some((memberType) => typeSymbolMatchesAnyName(memberType, names));
  }

  return false;
};
