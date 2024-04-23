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
  DEBUG_MODE = false;

  @CastToPositiveNumber()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(65535)
  DEBUG_PORT = 9000;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  IS_BILLING_ENABLED = false;

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
  BILLING_FREE_TRIAL_DURATION_IN_DAYS = 7;

  @IsString()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_STRIPE_API_KEY: string;

  @IsString()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_STRIPE_WEBHOOK_SECRET: string;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  TELEMETRY_ENABLED = true;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  TELEMETRY_ANONYMIZATION_ENABLED = true;

  @CastToPositiveNumber()
  @IsNumber()
  @IsOptional()
  PORT = 3000;

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
  ACCESS_TOKEN_EXPIRES_IN = '30m';

  @IsString()
  REFRESH_TOKEN_SECRET: string;

  @IsDuration()
  @IsOptional()
  REFRESH_TOKEN_EXPIRES_IN = '30m';

  @IsDuration()
  @IsOptional()
  REFRESH_TOKEN_COOL_DOWN = '1m';

  @IsString()
  LOGIN_TOKEN_SECRET = '30m';

  @IsDuration()
  @IsOptional()
  LOGIN_TOKEN_EXPIRES_IN = '15m';

  @IsString()
  @IsOptional()
  FILE_TOKEN_SECRET = 'random_string';

  @IsDuration()
  @IsOptional()
  FILE_TOKEN_EXPIRES_IN = '1d';

  // Auth
  @IsUrl({ require_tld: false })
  @IsOptional()
  FRONT_AUTH_CALLBACK_URL: string;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  AUTH_PASSWORD_ENABLED = true;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  @ValidateIf((env) => env.AUTH_PASSWORD_ENABLED)
  SIGN_IN_PREFILLED = false;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  AUTH_MICROSOFT_ENABLED = false;

  @IsString()
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_CLIENT_ID: string;

  @IsString()
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_TENANT_ID: string;

  @IsString()
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_CLIENT_SECRET: string;

  @IsUrl({ require_tld: false })
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_CALLBACK_URL: string;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  AUTH_GOOGLE_ENABLED = false;

  @IsString()
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED)
  AUTH_GOOGLE_CLIENT_ID: string;

  @IsString()
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED)
  AUTH_GOOGLE_CLIENT_SECRET: string;

  @IsUrl({ require_tld: false })
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED)
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
  STORAGE_LOCAL_PATH = '.local-storage';

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
  LOGGER_IS_BUFFER_ENABLED = true;

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

  @ValidateIf(
    (env) => env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.Sentry,
  )
  @IsString()
  SENTRY_FRONT_DSN: string;

  @ValidateIf(
    (env) => env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.Sentry,
  )
  @IsString()
  @IsOptional()
  SENTRY_RELEASE: string;

  @ValidateIf(
    (env) => env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.Sentry,
  )
  @IsString()
  @IsOptional()
  SENTRY_ENVIRONMENT: string;

  @IsDuration()
  @IsOptional()
  PASSWORD_RESET_TOKEN_EXPIRES_IN = '5m';

  @CastToPositiveNumber()
  @IsNumber()
  @ValidateIf((env) => env.WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION > 0)
  @IsStrictlyLowerThan('WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION', {
    message:
      '"WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION" should be strictly lower that "WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION"',
  })
  @ValidateIf((env) => env.WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION > 0)
  WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION = 30;

  @CastToPositiveNumber()
  @IsNumber()
  @ValidateIf((env) => env.WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION > 0)
  WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION = 60;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  IS_SIGN_UP_DISABLED = false;

  @CastToPositiveNumber()
  @IsOptional()
  @IsNumber()
  MUTATION_MAXIMUM_RECORD_AFFECTED = 100;

  REDIS_HOST = '127.0.0.1';

  @CastToPositiveNumber()
  REDIS_PORT = 6379;

  API_TOKEN_EXPIRES_IN = '100y';

  SHORT_TERM_TOKEN_EXPIRES_IN = '5m';

  @CastToBoolean()
  MESSAGING_PROVIDER_GMAIL_ENABLED = false;

  MESSAGE_QUEUE_TYPE: string = MessageQueueDriverType.Sync;

  EMAIL_FROM_ADDRESS = 'noreply@yourdomain.com';

  EMAIL_SYSTEM_ADDRESS = 'system@yourdomain.com';

  EMAIL_FROM_NAME = 'Felix from Twenty';

  EMAIL_DRIVER: EmailDriver = EmailDriver.Logger;

  EMAIL_SMTP_HOST: string;

  @CastToPositiveNumber()
  EMAIL_SMTP_PORT = 587;

  EMAIL_SMTP_USER: string;

  EMAIL_SMTP_PASSWORD: string;

  OPENROUTER_API_KEY: string;

  @CastToPositiveNumber()
  API_RATE_LIMITING_TTL = 100;

  @CastToPositiveNumber()
  API_RATE_LIMITING_LIMIT = 500;

  CACHE_STORAGE_TYPE = 'memory';

  @CastToPositiveNumber()
  CACHE_STORAGE_TTL: number = 3600 * 24 * 7;

  @CastToBoolean()
  CALENDAR_PROVIDER_GOOGLE_ENABLED = false;

  AUTH_GOOGLE_APIS_CALLBACK_URL: string;

  CHROME_EXTENSION_REDIRECT_URL: string;
}

export const validate = (
  config: Record<string, unknown>,
): EnvironmentVariables => {
  const validatedConfig = plainToClass(EnvironmentVariables, config);

  const errors = validateSync(validatedConfig);

  assert(!errors.length, errors.toString());

  return validatedConfig;
};
