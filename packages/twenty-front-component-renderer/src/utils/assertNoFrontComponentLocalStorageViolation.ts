import { isDefined } from 'twenty-shared/utils';

import { FrontComponentStorageError } from '@/utils/FrontComponentStorageError';
import { getFrontComponentLocalStorageViolation } from '@/utils/getFrontComponentLocalStorageViolation';
import { getFrontComponentLocalStorageViolationMessage } from '@/utils/getFrontComponentLocalStorageViolationMessage';

export const assertNoFrontComponentLocalStorageViolation = ({
  key,
  serializedValue,
  otherEntriesTotalLength,
}: {
  key: string;
  serializedValue: string;
  otherEntriesTotalLength: number;
}): void => {
  const violation = getFrontComponentLocalStorageViolation({
    key,
    serializedValue,
    otherEntriesTotalLength,
  });

  if (isDefined(violation)) {
    throw new FrontComponentStorageError(
      getFrontComponentLocalStorageViolationMessage(violation),
      violation,
    );
  }
};
