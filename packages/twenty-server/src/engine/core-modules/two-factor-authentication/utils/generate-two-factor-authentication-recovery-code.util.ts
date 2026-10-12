import { randomBytes } from 'crypto';

import {
  TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_ALPHABET,
  TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_GROUP_SIZE,
  TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_LENGTH,
} from 'src/engine/core-modules/two-factor-authentication/constants/two-factor-authentication-recovery-code.constant';

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
