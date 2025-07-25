import { z } from 'zod';

import { OTPStatus } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/otp.constants';

export enum TOTPHashAlgorithms {
  SHA1 = 'sha1',
  SHA256 = 'sha256',
  SHA512 = 'sha512',
}

export enum TOTPKeyEncodings {
  ASCII = 'ascii',
  BASE64 = 'base64',
  HEX = 'hex',
  LATIN1 = 'latin1',
  UTF8 = 'utf8',
}

export const TOTP_DEFAULT_CONFIGURATION = {
  algorithm: TOTPHashAlgorithms.SHA1,
  digits: 6,
  encodings: TOTPKeyEncodings.HEX, // Keep as hex - this is correct for @otplib/core
  window: 3,
  step: 30,
};

export type TotpContext = {
  status: OTPStatus;
  secret: string;
};

export type TOTPStrategyConfig = z.infer<typeof TOTP_STRATEGY_CONFIG_SCHEMA>;

export const TOTP_STRATEGY_CONFIG_SCHEMA = z.object({
  algorithm: z
    .nativeEnum(TOTPHashAlgorithms, {
      errorMap: () => ({
        message:
          'Invalid algorithm specified. Must be SHA1, SHA256, or SHA512.',
      }),
    })
    .optional(),
  digits: z
    .number({
      invalid_type_error: 'Digits must be a number.',
    })
    .int({ message: 'Digits must be a whole number.' })
    .min(6, { message: 'Digits must be at least 6.' })
    .max(8, { message: 'Digits cannot be more than 8.' })
    .optional(),
  encodings: z
    .nativeEnum(TOTPKeyEncodings, {
      errorMap: () => ({ message: 'Invalid encoding specified.' }),
    })
    .optional(),
  window: z.number().int().min(0).optional(),
  step: z
    .number({
      invalid_type_error: 'Step must be a number.',
    })
    .int()
    .min(1)
    .optional(),
  epoch: z.number().int().min(0).optional(),
});
