import { InjectionToken, OptionalFactoryDependency } from '@nestjs/common';

import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';

import { HOTPStrategyConfig } from './strategies/hotp.strategy';
import { TOTPStrategyConfig } from './strategies/totp.strategy';

export enum OTPHashAlgorithms {
  SHA1 = 'sha1',
  SHA256 = 'sha256',
  SHA512 = 'sha512',
}

export enum OTPKeyEncodings {
  ASCII = 'ascii',
  BASE64 = 'base64',
  HEX = 'hex',
  LATIN1 = 'latin1',
  UTF8 = 'utf8',
}

export enum OTPStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
}

export interface TwoFactorAuthenticationModuleOptions {
  type: TwoFactorAuthenticationStrategy;
  config: OTPStrategyConfig;
}

export type TwoFactorAuthenticationModuleAsyncOptions = {
  inject?: (InjectionToken | OptionalFactoryDependency)[];
  useFactory: (
    ...args: unknown[]
  ) => TwoFactorAuthenticationModuleOptions | undefined;
};

export type TotpContext = {
  strategy: TwoFactorAuthenticationStrategy.TOTP;
  status: OTPStatus;
  secret: string;
};

export type HotpContext = {
  strategy: TwoFactorAuthenticationStrategy.HOTP;
  status: OTPStatus;
  secret: string;
  counter: number;
};

export type OTPContext = TotpContext | HotpContext;

export type OTPStrategyConfig = HOTPStrategyConfig | TOTPStrategyConfig;
