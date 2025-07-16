import {
  OTPHashAlgorithms,
  OTPKeyEncodings,
} from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.interface';

export const TOT_DEFAULT_CONFIGURATION = {
  algorithm: OTPHashAlgorithms.SHA1,
  digits: 6,
  encodings: OTPKeyEncodings.HEX,
  window: 3,
  step: 30,
};
