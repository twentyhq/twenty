import { isDefined } from 'twenty-shared/utils';

// IS_NOT_NULL (and its deprecated 'isNotNull' form) is a legacy filter operand
// semantically identical to IS_NOT_EMPTY. The workflow filter evaluators only
// implement IS_NOT_EMPTY, so stored IS_NOT_NULL operands throw at runtime.
// Rewriting the exact serialized "operand" pair keeps this precise (a filter
// value that merely contains the string is never touched) and idempotent.
const LEGACY_NOT_NULL_OPERAND_FRAGMENTS = [
  '"operand":"IS_NOT_NULL"',
  '"operand":"isNotNull"',
];

const IS_NOT_EMPTY_OPERAND_FRAGMENT = '"operand":"IS_NOT_EMPTY"';

export const rewriteIsNotNullFilterOperands = <TValue>(
  value: TValue,
): { value: TValue; changed: boolean } => {
  if (!isDefined(value)) {
    return { value, changed: false };
  }

  const serialized = JSON.stringify(value);

  const rewritten = LEGACY_NOT_NULL_OPERAND_FRAGMENTS.reduce(
    (accumulator, fragment) =>
      accumulator.split(fragment).join(IS_NOT_EMPTY_OPERAND_FRAGMENT),
    serialized,
  );

  if (rewritten === serialized) {
    return { value, changed: false };
  }

  return { value: JSON.parse(rewritten) as TValue, changed: true };
};
