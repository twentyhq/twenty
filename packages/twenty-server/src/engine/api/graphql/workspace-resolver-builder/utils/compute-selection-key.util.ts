import { createHash } from 'crypto';

import { isPlainObject } from 'twenty-shared/utils';

import { SELECTION_KEY_SEPARATOR } from 'src/engine/api/graphql/workspace-resolver-builder/constants/selection-key-separator';
import { type GraphqlFieldSelection } from 'src/engine/api/graphql/workspace-resolver-builder/types/graphql-field-selection.type';

// Not sortKeysDeeply: graphql-js builds argument objects without a prototype, which it leaves unsorted
const sortKeysRecursively = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortKeysRecursively);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortKeysRecursively(value[key])]),
  );
};

export const computeSelectionKey = ({
  fieldName,
  arguments: fieldArguments,
}: Pick<GraphqlFieldSelection, 'fieldName' | 'arguments'>): string => {
  if (Object.keys(fieldArguments).length === 0) {
    return fieldName;
  }

  const argumentsHash = createHash('sha256')
    .update(JSON.stringify(sortKeysRecursively(fieldArguments)))
    .digest('hex')
    .slice(0, 16);

  return `${fieldName}${SELECTION_KEY_SEPARATOR}${argumentsHash}`;
};
