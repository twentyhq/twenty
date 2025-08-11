import { type FactoryProvider, type ModuleMetadata } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';

export enum CaptchaDriverType {
  GOOGLE_RECAPTCHA = 'GOOGLE_RECAPTCHA',
  TURNSTILE = 'TURNSTILE',
}

registerEnumType(CaptchaDriverType, {
  name: 'CaptchaDriverType',
});

export type CaptchaDriverOptions = {
  siteKey: string;
  secretKey: string;
};

export interface GoogleRecaptchaDriverFactoryOptions {
  type: CaptchaDriverType.GOOGLE_RECAPTCHA;
  options: CaptchaDriverOptions;
}

export interface TurnstileDriverFactoryOptions {
  type: CaptchaDriverType.TURNSTILE;
  options: CaptchaDriverOptions;
}

export type CaptchaModuleOptions =
  | GoogleRecaptchaDriverFactoryOptions
  | TurnstileDriverFactoryOptions;

export type CaptchaModuleAsyncOptions = {
  useFactory: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => CaptchaModuleOptions | Promise<CaptchaModuleOptions> | undefined;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
export type CaptchaValidateResult = { success: boolean; error?: string };
