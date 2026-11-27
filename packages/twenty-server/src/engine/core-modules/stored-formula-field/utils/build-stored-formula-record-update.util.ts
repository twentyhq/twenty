import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type StoredFormulaColumnExpression } from 'src/engine/core-modules/stored-formula-field/types/stored-formula-column-expression.type';

export const buildStoredFormulaRecordUpdate = ({
  columnExpressions,
  values,
}: {
  columnExpressions: Pick<
    StoredFormulaColumnExpression,
    'fieldName' | 'compositePropertyName'
  >[];
  values: unknown[];
}): Record<string, unknown> =>
  columnExpressions.reduce<Record<string, unknown>>(
    (recordUpdate, { fieldName, compositePropertyName }, columnIndex) => {
      const value = values[columnIndex] ?? null;

      if (!isDefined(compositePropertyName)) {
        return { ...recordUpdate, [fieldName]: value };
      }

      const compositeValue = recordUpdate[fieldName];

      return {
        ...recordUpdate,
        [fieldName]: {
          ...(isPlainObject(compositeValue) ? compositeValue : {}),
          [compositePropertyName]: value,
        },
      };
    },
    {},
  );
