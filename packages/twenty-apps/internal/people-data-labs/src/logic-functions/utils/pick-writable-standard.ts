import { isDefined } from 'src/utils/is-defined';

export const pickWritableStandard = ({
  standard,
  current,
  emptyChecks,
}: {
  standard: Record<string, unknown>;
  current: Record<string, unknown>;
  emptyChecks: Record<string, (current: unknown) => boolean>;
}): Record<string, unknown> => {
  const writable: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(standard)) {
    const isEmptyCheck = emptyChecks[key];
    if (isDefined(isEmptyCheck) && isEmptyCheck(current[key])) {
      writable[key] = value;
    }
  }

  return writable;
};
