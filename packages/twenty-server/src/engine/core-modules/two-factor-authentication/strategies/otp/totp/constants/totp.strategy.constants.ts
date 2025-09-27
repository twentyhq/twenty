import { z } from 'zod';

import { type OTPStatus } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/otp.constants';

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
    .enum(TOTPHashAlgorithms, {
      error: () =>
        'Invalid algorithm specified. Must be SHA1, SHA256, or SHA512.',
    })
    .optional(),
  digits: z
    .int({
      error: 'Digits must be a whole number.',
    })
    .min(6, {
      error: 'Digits must be at least 6.',
    })
    .max(8, {
      error: 'Digits cannot be more than 8.',
    })
    .optional(),
  encodings: z
    .enum(TOTPKeyEncodings, {
      error: () => 'Invalid encoding specified.',
    })
    .optional(),
  window: z.int().min(0).optional(),
  step: z.int().min(1).optional(),
  epoch: z.int().min(0).optional(),
});
