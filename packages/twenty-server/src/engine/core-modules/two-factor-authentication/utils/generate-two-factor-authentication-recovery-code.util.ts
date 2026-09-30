import { randomBytes } from 'crypto';

import {
  TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_ALPHABET,
  TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_GROUP_SIZE,
  TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_LENGTH,
} from 'src/engine/core-modules/two-factor-authentication/constants/two-factor-authentication-recovery-code.constant';

// The alphabet has 32 symbols, so a byte modulo 32 picks each one with equal
// probability and 20 symbols carry 100 bits of entropy.
export const generateTwoFactorAuthenticationRecoveryCode = (): string => {
  const symbols = Array.from(
    randomBytes(TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_LENGTH),
    (byte) =>
      TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_ALPHABET[
        byte % TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_ALPHABET.length
      ],
  ).join('');

  const groups: string[] = [];

  for (
    let index = 0;
    index < symbols.length;
    index += TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_GROUP_SIZE
  ) {
    groups.push(
      symbols.slice(
        index,
        index + TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_GROUP_SIZE,
      ),
    );
  }

  return groups.join('-');
};
