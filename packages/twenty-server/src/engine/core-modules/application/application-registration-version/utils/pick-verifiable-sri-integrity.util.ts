import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { parseSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/parse-sri-integrity.util';

export const pickVerifiableSriIntegrity = (
  integrity: string | null,
): string | null => {
  if (!isDefined(integrity)) {
    return null;
  }

  const verifiableEntries = parseSriIntegrity(integrity).map(
    ({ algorithm, digest }) => `${algorithm}-${digest}`,
  );

  return isNonEmptyArray(verifiableEntries)
    ? verifiableEntries.join(' ')
    : null;
};
