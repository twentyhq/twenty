import {
  FieldMetadataType,
  type RollupResultFieldMetadataType,
} from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

// One canonical form per result type so a computed value compares to a stored one in JS
export const buildRollupValueSqlExpression = ({
  expression,
  resultType,
}: {
  expression: string;
  resultType: RollupResultFieldMetadataType;
}): string => {
  switch (resultType) {
    case FieldMetadataType.NUMBER:
      return `(${expression})::double precision`;
    case FieldMetadataType.DATE:
      return `(${expression})::text`;
    case FieldMetadataType.DATE_TIME:
      return `to_char((${expression}) AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;
    default:
      return assertUnreachable(resultType);
  }
};
