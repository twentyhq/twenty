import { isDefined } from 'twenty-shared/utils';

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
