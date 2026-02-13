import { type Type } from 'ts-morph';

import { typeSymbolMatchesAnyName } from './type-symbol-matches-any-name';

const REACT_ELEMENT_TYPE_NAMES = new Set([
  'ReactNode',
  'ReactElement',
  'Element',
]);

const REACT_COMPONENT_TYPE_NAMES = new Set([
  'FunctionComponent',
  'ComponentType',
  'IconComponent',
]);

const ALL_REACT_TYPE_NAMES = new Set([
  ...REACT_ELEMENT_TYPE_NAMES,
  ...REACT_COMPONENT_TYPE_NAMES,
]);

export const isReactElementType = (propertyType: Type): boolean => {
  return typeSymbolMatchesAnyName(propertyType, ALL_REACT_TYPE_NAMES);
};
