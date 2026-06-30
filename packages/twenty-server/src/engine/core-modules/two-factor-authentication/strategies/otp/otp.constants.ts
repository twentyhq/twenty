import { type TotpContext } from './totp/constants/totp.strategy.constants';

export enum OTPStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
}

export type OTPContext = TotpContext;
