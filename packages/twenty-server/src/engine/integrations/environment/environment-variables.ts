import { LogLevel } from '@nestjs/common';

import { plainToClass } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
  validateSync,
  IsBoolean,
  IsNumber,
  IsDefined,
  Min,
  Max,
} from 'class-validator';

import { EmailDriver } from 'src/engine/integrations/email/interfaces/email.interface';

import { assert } from 'src/utils/assert';
import { CastToStringArray } from 'src/engine/integrations/environment/decorators/cast-to-string-array.decorator';
import { ExceptionHandlerDriver } from 'src/engine/integrations/exception-handler/interfaces';
import { StorageDriverType } from 'src/engine/integrations/file-storage/interfaces';
import { LoggerDriverType } from 'src/engine/integrations/logger/interfaces';
import { IsStrictlyLowerThan } from 'src/engine/integrations/environment/decorators/is-strictly-lower-than.decorator';
import { MessageQueueDriverType } from 'src/engine/integrations/message-queue/interfaces';

import { IsDuration } from './decorators/is-duration.decorator';
import { AwsRegion } from './interfaces/aws-region.interface';
import { IsAWSRegion } from './decorators/is-aws-region.decorator';
import { CastToBoolean } from './decorators/cast-to-boolean.decorator';
import { SupportDriver } from './interfaces/support.interface';
import { CastToPositiveNumber } from './decorators/cast-to-positive-number.decorator';
import { CastToLogLevelArray } from './decorators/cast-to-log-level-array.decorator';

export class EnvironmentVariables {
  // Misc
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  DEBUG_MODE: boolean = false;

  @CastToPositiveNumber()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(65535)
  DEBUG_PORT: number = 9000;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  SIGN_IN_PREFILLED: boolean = false;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  IS_BILLING_ENABLED: boolean = false;

  @IsString()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_PLAN_REQUIRED_LINK: string;

  @IsString()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_STRIPE_BASE_PLAN_PRODUCT_ID: string;

  @IsNumber()
  @CastToPositiveNumber()
  @IsOptional()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_FREE_TRIAL_DURATION_IN_DAYS: number = 7;

  @IsString()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_STRIPE_API_KEY: string;

  @IsString()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_STRIPE_WEBHOOK_SECRET: string;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  TELEMETRY_ENABLED: boolean = true;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  TELEMETRY_ANONYMIZATION_ENABLED: boolean = true;

  @CastToPositiveNumber()
  @IsNumber()
  @IsOptional()
  PORT: number = 3000;

  // Database
  @IsDefined()
  @IsUrl({
    protocols: ['postgres'],
    require_tld: false,
    allow_underscores: true,
  })
  PG_DATABASE_URL: string;

  // Frontend URL
  @IsUrl({ require_tld: false })
  FRONT_BASE_URL: string;

  // Server URL
  @IsUrl({ require_tld: false })
  @IsOptional()
  SERVER_URL: string;

  // Json Web Token
  @IsString()
  ACCESS_TOKEN_SECRET: string;

  @IsDuration()
  @IsOptional()
  ACCESS_TOKEN_EXPIRES_IN: string = '30m';

  @IsString()
  REFRESH_TOKEN_SECRET: string;

  @IsDuration()
  @IsOptional()
  REFRESH_TOKEN_EXPIRES_IN: string = '30m';

  @IsDuration()
  @IsOptional()
  REFRESH_TOKEN_COOL_DOWN: string = '1m';

  @IsString()
  LOGIN_TOKEN_SECRET: string = '30m';

  @IsDuration()
  @IsOptional()
  LOGIN_TOKEN_EXPIRES_IN: string = '15m';

  @IsString()
  @IsOptional()
  FILE_TOKEN_SECRET: string = 'random_string';

  @IsDuration()
  @IsOptional()
  FILE_TOKEN_EXPIRES_IN: string = '1d';

  @IsString()
  IV_SECRET: string;

  // Auth
  @IsUrl({ require_tld: false })
  @IsOptional()
  FRONT_AUTH_CALLBACK_URL: string;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  AUTH_GOOGLE_ENABLED: boolean = false;

  @IsString()
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED === true)
  AUTH_GOOGLE_CLIENT_ID: string;

  @IsString()
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED === true)
  AUTH_GOOGLE_CLIENT_SECRET: string;

  @IsUrl({ require_tld: false })
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED === true)
  AUTH_GOOGLE_CALLBACK_URL: string;

  // Storage
  @IsEnum(StorageDriverType)
  @IsOptional()
  STORAGE_TYPE: StorageDriverType = StorageDriverType.Local;

  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsAWSRegion()
  STORAGE_S3_REGION: AwsRegion;

  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsString()
  STORAGE_S3_NAME: string;

  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsString()
  @IsOptional()
  STORAGE_S3_ENDPOINT: string;

  @IsString()
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.Local)
  STORAGE_LOCAL_PATH: string = '.local-storage';

  // Support
  @IsEnum(SupportDriver)
  @IsOptional()
  SUPPORT_DRIVER: SupportDriver = SupportDriver.None;

  @ValidateIf((env) => env.SUPPORT_DRIVER === SupportDriver.Front)
  @IsString()
  SUPPORT_FRONT_CHAT_ID: string;

  @ValidateIf((env) => env.SUPPORT_DRIVER === SupportDriver.Front)
  @IsString()
  SUPPORT_FRONT_HMAC_KEY: string;

  @IsEnum(LoggerDriverType)
  @IsOptional()
  LOGGER_DRIVER: LoggerDriverType = LoggerDriverType.Console;

  @CastToBoolean()
  @IsBoolean()
  @IsOptional()
  LOGGER_IS_BUFFER_ENABLED: boolean = true;

  @IsEnum(ExceptionHandlerDriver)
  @IsOptional()
  EXCEPTION_HANDLER_DRIVER: ExceptionHandlerDriver =
    ExceptionHandlerDriver.Console;

  @CastToLogLevelArray()
  @IsOptional()
  LOG_LEVELS: LogLevel[] = ['log', 'error', 'warn'];

  @CastToStringArray()
  @IsOptional()
  DEMO_WORKSPACE_IDS: string[] = [];

  @ValidateIf(
    (env) => env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.Sentry,
  )
  @IsString()
  SENTRY_DSN: string;

  @IsDuration()
  @IsOptional()
  PASSWORD_RESET_TOKEN_EXPIRES_IN: string = '5m';

  @CastToPositiveNumber()
  @IsNumber()
  @ValidateIf((env) => env.WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION > 0)
  @IsStrictlyLowerThan('WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION', {
    message:
      '"WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION" should be strictly lower that "WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION"',
  })
  @ValidateIf((env) => env.WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION > 0)
  WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION: number = 30;

  @CastToPositiveNumber()
  @IsNumber()
  @ValidateIf((env) => env.WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION > 0)
  WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION: number = 60;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  IS_SIGN_UP_DISABLED: boolean = false;

  @CastToPositiveNumber()
  @IsOptional()
  @IsNumber()
  MUTATION_MAXIMUM_RECORD_AFFECTED: number = 100;

  REDIS_HOST: string = '127.0.0.1';

  REDIS_PORT: number = 6379;

  API_TOKEN_EXPIRES_IN: string = '100y';

  SHORT_TERM_TOKEN_EXPIRES_IN: string = '5m';

  MESSAGING_PROVIDER_GMAIL_ENABLED: boolean = false;

  MESSAGING_PROVIDER_GMAIL_CALLBACK_URL: string;

  MESSAGE_QUEUE_TYPE: string = MessageQueueDriverType.Sync;

  EMAIL_FROM_ADDRESS: string = 'noreply@yourdomain.com';

  EMAIL_SYSTEM_ADDRESS: string = 'system@yourdomain.com';

  EMAIL_FROM_NAME: string = 'Felix from Twenty';

  EMAIL_DRIVER: EmailDriver = EmailDriver.Logger;

  EMAIL_SMTP_HOST: string;

  EMAIL_SMTP_PORT: number = 587;

  EMAIL_SMTP_USER: string;

  EMAIL_SMTP_PASSWORD: string;

  OPENROUTER_API_KEY: string;

  API_RATE_LIMITING_TTL: number = 100;

  API_RATE_LIMITING_LIMIT: number = 500;

  CACHE_STORAGE_TYPE: string = 'memory';

  CACHE_STORAGE_TTL: number = 3600 * 24 * 7;

  CALENDAR_PROVIDER_GOOGLE_ENABLED: boolean = false;

  AUTH_GOOGLE_APIS_CALLBACK_URL: string;
}

export const validate = (config: Record<string, unknown>) => {
  const validatedConfig = plainToClass(EnvironmentVariables, config);

  const errors = validateSync(validatedConfig);

  assert(!errors.length, errors.toString());

  return validatedConfig;
};
