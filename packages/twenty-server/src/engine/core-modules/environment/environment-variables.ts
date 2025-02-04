import { LogLevel, Logger } from '@nestjs/common';

import { plainToClass } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateIf,
  validateSync,
} from 'class-validator';

import { EmailDriver } from 'src/engine/core-modules/email/interfaces/email.interface';
import { AwsRegion } from 'src/engine/core-modules/environment/interfaces/aws-region.interface';
import { NodeEnvironment } from 'src/engine/core-modules/environment/interfaces/node-environment.interface';
import { SupportDriver } from 'src/engine/core-modules/environment/interfaces/support.interface';
import { LLMChatModelDriver } from 'src/engine/core-modules/llm-chat-model/interfaces/llm-chat-model.interface';
import { LLMTracingDriver } from 'src/engine/core-modules/llm-tracing/interfaces/llm-tracing.interface';

import { CacheStorageType } from 'src/engine/core-modules/cache-storage/types/cache-storage-type.enum';
import { CaptchaDriverType } from 'src/engine/core-modules/captcha/interfaces';
import { CastToBoolean } from 'src/engine/core-modules/environment/decorators/cast-to-boolean.decorator';
import { CastToLogLevelArray } from 'src/engine/core-modules/environment/decorators/cast-to-log-level-array.decorator';
import { CastToPositiveNumber } from 'src/engine/core-modules/environment/decorators/cast-to-positive-number.decorator';
import { CastToStringArray } from 'src/engine/core-modules/environment/decorators/cast-to-string-array.decorator';
import { EnvironmentVariablesMetadata } from 'src/engine/core-modules/environment/decorators/environment-variables-metadata.decorator';
import { IsAWSRegion } from 'src/engine/core-modules/environment/decorators/is-aws-region.decorator';
import { IsDuration } from 'src/engine/core-modules/environment/decorators/is-duration.decorator';
import { IsStrictlyLowerThan } from 'src/engine/core-modules/environment/decorators/is-strictly-lower-than.decorator';
import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';
import { EnvironmentVariablesSubGroup } from 'src/engine/core-modules/environment/enums/environment-variables-sub-group.enum';
import { ExceptionHandlerDriver } from 'src/engine/core-modules/exception-handler/interfaces';
import { StorageDriverType } from 'src/engine/core-modules/file-storage/interfaces';
import { LoggerDriverType } from 'src/engine/core-modules/logger/interfaces';
import { MessageQueueDriverType } from 'src/engine/core-modules/message-queue/interfaces';
import { ServerlessDriverType } from 'src/engine/core-modules/serverless/serverless.interface';
import { assert } from 'src/utils/assert';

export class EnvironmentVariables {
  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    description: 'Is password authentication enabled',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  AUTH_PASSWORD_ENABLED = true;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    description: 'Is sign in prefilled enabled',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  @ValidateIf((env) => env.AUTH_PASSWORD_ENABLED)
  SIGN_IN_PREFILLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    description: 'Is email verification required',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  IS_EMAIL_VERIFICATION_REQUIRED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    description: 'Email verification token expires in',
  })
  @IsDuration()
  @IsOptional()
  EMAIL_VERIFICATION_TOKEN_EXPIRES_IN = '1h';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    description: 'Password reset token expires in',
  })
  @IsDuration()
  @IsOptional()
  PASSWORD_RESET_TOKEN_EXPIRES_IN = '5m';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.GoogleAuth,
    description: 'Is Google Calendar provider enabled',
  })
  @CastToBoolean()
  CALENDAR_PROVIDER_GOOGLE_ENABLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.GoogleAuth,
    description: 'Google Auth APIs callback URL',
  })
  AUTH_GOOGLE_APIS_CALLBACK_URL: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.GoogleAuth,
    description: 'Is Google Auth enabled',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  AUTH_GOOGLE_ENABLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.GoogleAuth,
    sensitive: true,
    description: 'Google Auth client ID',
  })
  @IsString()
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED)
  AUTH_GOOGLE_CLIENT_ID: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.GoogleAuth,
    sensitive: true,
    description: 'Google Auth client secret',
  })
  @IsString()
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED)
  AUTH_GOOGLE_CLIENT_SECRET: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.GoogleAuth,
    sensitive: true,
    description: 'Google Auth callback URL',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED)
  AUTH_GOOGLE_CALLBACK_URL: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.GoogleAuth,
    description: 'Is Gmail messaging provider enabled',
  })
  @CastToBoolean()
  MESSAGING_PROVIDER_GMAIL_ENABLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.MicrosoftAuth,
    description: 'Is Microsoft Auth enabled',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  AUTH_MICROSOFT_ENABLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.MicrosoftAuth,
    sensitive: true,
    description: 'Microsoft Auth client ID',
  })
  @IsString()
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_CLIENT_ID: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.MicrosoftAuth,
    sensitive: true,
    description: 'Microsoft Auth client secret',
  })
  @IsString()
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_CLIENT_SECRET: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.MicrosoftAuth,
    sensitive: true,
    description: 'Microsoft Auth callback URL',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_CALLBACK_URL: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.MicrosoftAuth,
    sensitive: true,
    description: 'Microsoft Auth APIs callback URL',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_APIS_CALLBACK_URL: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.MicrosoftAuth,
    description: 'Is Microsoft messaging provider enabled',
  })
  @CastToBoolean()
  MESSAGING_PROVIDER_MICROSOFT_ENABLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.MicrosoftAuth,
    description: 'Is Microsoft Calendar provider enabled',
  })
  @CastToBoolean()
  CALENDAR_PROVIDER_MICROSOFT_ENABLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.Tokens,
    sensitive: true,
    description: 'Access token secret',
  })
  @IsOptional()
  @IsString()
  ACCESS_TOKEN_SECRET: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.Tokens,
    description: 'Access token expires in',
  })
  @IsDuration()
  @IsOptional()
  ACCESS_TOKEN_EXPIRES_IN = '30m';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.Tokens,
    description: 'Refresh token expires in',
  })
  @IsOptional()
  REFRESH_TOKEN_EXPIRES_IN = '60d';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.Tokens,
    description: 'Refresh token cool down',
  })
  @IsDuration()
  @IsOptional()
  REFRESH_TOKEN_COOL_DOWN = '1m';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.Tokens,
    description: 'Login token expires in',
  })
  @IsDuration()
  @IsOptional()
  LOGIN_TOKEN_EXPIRES_IN = '15m';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.Tokens,
    description: 'File token expires in',
  })
  @IsDuration()
  @IsOptional()
  FILE_TOKEN_EXPIRES_IN = '1d';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.Tokens,
    description: 'Invitation token expires in',
  })
  @IsDuration()
  @IsOptional()
  INVITATION_TOKEN_EXPIRES_IN = '30d';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Authentication,
    subGroup: EnvironmentVariablesSubGroup.Tokens,
    description: 'Short term token expires in',
  })
  SHORT_TERM_TOKEN_EXPIRES_IN = '5m';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Email,
    subGroup: EnvironmentVariablesSubGroup.EmailSettings,
    description: 'Email from address',
  })
  EMAIL_FROM_ADDRESS = 'noreply@yourdomain.com';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Email,
    subGroup: EnvironmentVariablesSubGroup.EmailSettings,
    description: 'Email system address',
  })
  EMAIL_SYSTEM_ADDRESS = 'system@yourdomain.com';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Email,
    subGroup: EnvironmentVariablesSubGroup.EmailSettings,
    description: 'Email from name',
  })
  EMAIL_FROM_NAME = 'Felix from Twenty';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Email,
    subGroup: EnvironmentVariablesSubGroup.EmailSettings,
    description: 'Email driver',
  })
  EMAIL_DRIVER: EmailDriver = EmailDriver.Logger;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Email,
    subGroup: EnvironmentVariablesSubGroup.SmtpConfig,
    description: 'SMTP host',
  })
  EMAIL_SMTP_HOST: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Email,
    subGroup: EnvironmentVariablesSubGroup.SmtpConfig,
    description: 'SMTP port',
  })
  @CastToPositiveNumber()
  EMAIL_SMTP_PORT = 587;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Email,
    subGroup: EnvironmentVariablesSubGroup.SmtpConfig,
    description: 'SMTP user',
  })
  EMAIL_SMTP_USER: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Email,
    subGroup: EnvironmentVariablesSubGroup.SmtpConfig,
    sensitive: true,
    description: 'SMTP password',
  })
  EMAIL_SMTP_PASSWORD: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Storage,
    description: 'Storage type',
  })
  @IsEnum(StorageDriverType)
  @IsOptional()
  STORAGE_TYPE: StorageDriverType = StorageDriverType.Local;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Storage,
    description: 'Storage local path',
  })
  @IsString()
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.Local)
  STORAGE_LOCAL_PATH = '.local-storage';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Storage,
    subGroup: EnvironmentVariablesSubGroup.S3Config,
    description: 'Storage S3 region',
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsAWSRegion()
  STORAGE_S3_REGION: AwsRegion;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Storage,
    subGroup: EnvironmentVariablesSubGroup.S3Config,
    description: 'Storage S3 name',
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsString()
  STORAGE_S3_NAME: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Storage,
    subGroup: EnvironmentVariablesSubGroup.S3Config,
    description: 'Storage S3 endpoint',
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsString()
  @IsOptional()
  STORAGE_S3_ENDPOINT: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Storage,
    subGroup: EnvironmentVariablesSubGroup.S3Config,
    sensitive: true,
    description: 'Storage S3 access key ID',
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsString()
  @IsOptional()
  STORAGE_S3_ACCESS_KEY_ID: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Storage,
    subGroup: EnvironmentVariablesSubGroup.S3Config,
    sensitive: true,
    description: 'Storage S3 secret access key',
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsString()
  @IsOptional()
  STORAGE_S3_SECRET_ACCESS_KEY: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Serverless,
    description: 'Serverless type',
  })
  @IsEnum(ServerlessDriverType)
  @IsOptional()
  SERVERLESS_TYPE: ServerlessDriverType = ServerlessDriverType.Local;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Serverless,
    description: 'Serverless function exec throttle limit',
  })
  @CastToPositiveNumber()
  SERVERLESS_FUNCTION_EXEC_THROTTLE_LIMIT = 10;

  // milliseconds
  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Serverless,
    description: 'Serverless function exec throttle TTL',
  })
  @CastToPositiveNumber()
  SERVERLESS_FUNCTION_EXEC_THROTTLE_TTL = 1000;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Serverless,
    subGroup: EnvironmentVariablesSubGroup.LambdaConfig,
    description: 'Serverless Lambda region',
  })
  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.Lambda)
  @IsAWSRegion()
  SERVERLESS_LAMBDA_REGION: AwsRegion;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Serverless,
    subGroup: EnvironmentVariablesSubGroup.LambdaConfig,
    description: 'Serverless Lambda role',
  })
  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.Lambda)
  @IsString()
  @IsOptional()
  SERVERLESS_LAMBDA_ROLE: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Serverless,
    subGroup: EnvironmentVariablesSubGroup.LambdaConfig,
    sensitive: true,
    description: 'Serverless Lambda access key ID',
  })
  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.Lambda)
  @IsString()
  @IsOptional()
  SERVERLESS_LAMBDA_ACCESS_KEY_ID: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Serverless,
    subGroup: EnvironmentVariablesSubGroup.LambdaConfig,
    sensitive: true,
    description: 'Serverless Lambda secret access key',
  })
  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.Lambda)
  @IsString()
  @IsOptional()
  SERVERLESS_LAMBDA_SECRET_ACCESS_KEY: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Analytics,
    description: 'Is analytics enabled',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  ANALYTICS_ENABLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Analytics,
    description: 'Is telemetry enabled',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  TELEMETRY_ENABLED = true;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Analytics,
    subGroup: EnvironmentVariablesSubGroup.TinybirdConfig,
    sensitive: true,
    description: 'Tinybird ingest token',
  })
  @IsString()
  @ValidateIf((env) => env.ANALYTICS_ENABLED)
  TINYBIRD_INGEST_TOKEN: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Analytics,
    subGroup: EnvironmentVariablesSubGroup.TinybirdConfig,
    sensitive: true,
    description: 'Tinybird workspace UUID',
  })
  @IsString()
  @ValidateIf((env) => env.ANALYTICS_ENABLED)
  TINYBIRD_WORKSPACE_UUID: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Analytics,
    subGroup: EnvironmentVariablesSubGroup.TinybirdConfig,
    sensitive: true,
    description: 'Tinybird generate JWT token',
  })
  @IsString()
  @ValidateIf((env) => env.ANALYTICS_ENABLED)
  TINYBIRD_GENERATE_JWT_TOKEN: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Billing,
    description: 'Is billing enabled',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  IS_BILLING_ENABLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Billing,
    description: 'Billing plan required link',
  })
  @IsString()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_PLAN_REQUIRED_LINK: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Billing,
    description: 'Billing free trial with credit card duration in days',
  })
  @IsNumber()
  @CastToPositiveNumber()
  @IsOptional()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS = 30;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Billing,
    description: 'Billing free trial without credit card duration in days',
  })
  @IsNumber()
  @CastToPositiveNumber()
  @IsOptional()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_FREE_TRIAL_WITHOUT_CREDIT_CARD_DURATION_IN_DAYS = 7;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Billing,
    subGroup: EnvironmentVariablesSubGroup.StripeConfig,
    sensitive: true,
    description: 'Billing Stripe API key',
  })
  @IsString()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_STRIPE_API_KEY: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Billing,
    subGroup: EnvironmentVariablesSubGroup.StripeConfig,
    sensitive: true,
    description: 'Billing Stripe webhook secret',
  })
  @IsString()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_STRIPE_WEBHOOK_SECRET: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Billing,
    sensitive: true,
    subGroup: EnvironmentVariablesSubGroup.StripeConfig,
    description: 'Billing Stripe base plan product ID',
  })
  @IsString()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_STRIPE_BASE_PLAN_PRODUCT_ID: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Frontend,
    description: 'Frontend domain',
  })
  @IsString()
  @IsOptional()
  FRONT_DOMAIN?: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Frontend,
    description: 'Frontend default subdomain',
  })
  @IsString()
  @ValidateIf((env) => env.IS_MULTIWORKSPACE_ENABLED)
  DEFAULT_SUBDOMAIN = 'app';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Frontend,
    description: 'Frontend protocol',
  })
  @IsString()
  @IsOptional()
  FRONT_PROTOCOL?: 'http' | 'https' = 'http';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Frontend,
    description: 'Frontend port',
  })
  @CastToPositiveNumber()
  @IsNumber()
  @IsOptional()
  FRONT_PORT?: number;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Frontend,
    description: 'Chrome extension ID',
  })
  @IsString()
  @IsOptional()
  CHROME_EXTENSION_ID: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Logging,
    description: 'Logging driver',
  })
  @IsEnum(LoggerDriverType)
  @IsOptional()
  LOGGER_DRIVER: LoggerDriverType = LoggerDriverType.Console;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Logging,
    description: 'Is buffer enabled for logging',
  })
  @CastToBoolean()
  @IsBoolean()
  @IsOptional()
  LOGGER_IS_BUFFER_ENABLED = true;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Logging,
    description: 'Exception handler driver',
  })
  @IsEnum(ExceptionHandlerDriver)
  @IsOptional()
  EXCEPTION_HANDLER_DRIVER: ExceptionHandlerDriver =
    ExceptionHandlerDriver.Console;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Logging,
    description: 'Logging levels',
  })
  @CastToLogLevelArray()
  @IsOptional()
  LOG_LEVELS: LogLevel[] = ['log', 'error', 'warn'];

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Logging,
    subGroup: EnvironmentVariablesSubGroup.SentryConfig,
    description: 'Sentry DSN',
  })
  @ValidateIf(
    (env) => env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.Sentry,
  )
  @IsString()
  SENTRY_DSN: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Logging,
    subGroup: EnvironmentVariablesSubGroup.SentryConfig,
    description: 'Sentry Front DSN',
  })
  @ValidateIf(
    (env) => env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.Sentry,
  )
  @IsString()
  SENTRY_FRONT_DSN: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Logging,
    subGroup: EnvironmentVariablesSubGroup.SentryConfig,
    description: 'Sentry release',
  })
  @ValidateIf(
    (env) => env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.Sentry,
  )
  @IsString()
  @IsOptional()
  SENTRY_RELEASE: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Logging,
    subGroup: EnvironmentVariablesSubGroup.SentryConfig,
    description: 'Sentry environment',
  })
  @ValidateIf(
    (env) => env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.Sentry,
  )
  @IsString()
  @IsOptional()
  SENTRY_ENVIRONMENT: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Support,
    description: 'Support driver',
  })
  @IsEnum(SupportDriver)
  @IsOptional()
  SUPPORT_DRIVER: SupportDriver = SupportDriver.None;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Support,
    subGroup: EnvironmentVariablesSubGroup.FrontSupportConfig,
    sensitive: true,
    description: 'Support front chat ID',
  })
  @ValidateIf((env) => env.SUPPORT_DRIVER === SupportDriver.Front)
  @IsString()
  SUPPORT_FRONT_CHAT_ID: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Support,
    subGroup: EnvironmentVariablesSubGroup.FrontSupportConfig,
    sensitive: true,
    description: 'Support front HMAC key',
  })
  @ValidateIf((env) => env.SUPPORT_DRIVER === SupportDriver.Front)
  @IsString()
  SUPPORT_FRONT_HMAC_KEY: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Database,
    sensitive: true,
    description: 'Database URL',
  })
  @IsDefined()
  @IsUrl({
    protocols: ['postgres'],
    require_tld: false,
    allow_underscores: true,
    require_host: false,
  })
  PG_DATABASE_URL: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Database,
    description: 'Is SSL allowed for database',
  })
  @CastToBoolean()
  @IsBoolean()
  @IsOptional()
  PG_SSL_ALLOW_SELF_SIGNED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Cache,
    description: 'Cache storage type',
  })
  CACHE_STORAGE_TYPE: CacheStorageType = CacheStorageType.Redis;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Cache,
    description: 'Cache storage TTL',
  })
  @CastToPositiveNumber()
  CACHE_STORAGE_TTL: number = 3600 * 24 * 7;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Cache,
    sensitive: true,
    description: 'Cache storage URL',
  })
  @IsOptional()
  @ValidateIf(
    (env) =>
      env.CACHE_STORAGE_TYPE === CacheStorageType.Redis ||
      env.MESSAGE_QUEUE_TYPE === MessageQueueDriverType.BullMQ,
  )
  @IsUrl({
    protocols: ['redis'],
    require_tld: false,
    allow_underscores: true,
  })
  REDIS_URL: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    description: 'Is debug mode enabled',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  DEBUG_MODE = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    description: 'Node environment',
  })
  @IsEnum(NodeEnvironment)
  @IsString()
  NODE_ENV: NodeEnvironment = NodeEnvironment.development;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    description: 'Debug port',
  })
  @CastToPositiveNumber()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(65535)
  DEBUG_PORT = 9000;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    description: 'Server port',
  })
  @CastToPositiveNumber()
  @IsNumber()
  @IsOptional()
  PORT = 3000;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    description: 'Server URL',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @IsOptional()
  SERVER_URL = 'http://localhost:3000';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    sensitive: true,
    description: 'Server secret',
  })
  @IsString()
  APP_SECRET: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    sensitive: true,
    description: 'Session store secret',
  })
  @IsString()
  @IsOptional()
  SESSION_STORE_SECRET = 'replace_me_with_a_random_string_session';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    description: 'Mutation maximum affected records',
  })
  @CastToPositiveNumber()
  @IsOptional()
  @IsNumber()
  MUTATION_MAXIMUM_AFFECTED_RECORDS = 100;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    subGroup: EnvironmentVariablesSubGroup.RateLimiting,
    description: 'Rate limiting TTL',
  })
  @CastToPositiveNumber()
  API_RATE_LIMITING_TTL = 100;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    subGroup: EnvironmentVariablesSubGroup.RateLimiting,
    description: 'Rate limiting limit',
  })
  @CastToPositiveNumber()
  API_RATE_LIMITING_LIMIT = 500;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    subGroup: EnvironmentVariablesSubGroup.SSL,
    description: 'SSL key path',
  })
  @IsString()
  @IsOptional()
  SSL_KEY_PATH: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    subGroup: EnvironmentVariablesSubGroup.SSL,
    description: 'SSL certificate path',
  })
  @IsString()
  @IsOptional()
  SSL_CERT_PATH: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    subGroup: EnvironmentVariablesSubGroup.CloudflareConfig,
    sensitive: true,
    description: 'Cloudflare API key',
  })
  @IsString()
  @ValidateIf((env) => env.CLOUDFLARE_ZONE_ID)
  CLOUDFLARE_API_KEY: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    subGroup: EnvironmentVariablesSubGroup.CloudflareConfig,
    description: 'Cloudflare Zone ID',
  })
  @IsString()
  @ValidateIf((env) => env.CLOUDFLARE_API_KEY)
  CLOUDFLARE_ZONE_ID: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.LLM,
    description: 'LLM chat model driver',
  })
  LLM_CHAT_MODEL_DRIVER: LLMChatModelDriver;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.LLM,
    sensitive: true,
    description: 'OpenAI API key',
  })
  OPENAI_API_KEY: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.LLM,
    sensitive: true,
    description: 'Langfuse secret key',
  })
  LANGFUSE_SECRET_KEY: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.LLM,
    description: 'Langfuse public key',
  })
  LANGFUSE_PUBLIC_KEY: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.LLM,
    description: 'LLM tracing driver',
  })
  LLM_TRACING_DRIVER: LLMTracingDriver = LLMTracingDriver.Console;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Workspace,
    description: 'Is multiworkspace enabled',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  IS_MULTIWORKSPACE_ENABLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Workspace,
    description: 'Permissions enabled',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  PERMISSIONS_ENABLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Workspace,
    description: 'Demo workspace IDs',
  })
  @CastToStringArray()
  @IsOptional()
  DEMO_WORKSPACE_IDS: string[] = [];

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Workspace,
    description: 'Workspace inactive days before notification',
  })
  @CastToPositiveNumber()
  @IsNumber()
  @ValidateIf((env) => env.WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION > 0)
  @IsStrictlyLowerThan('WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION', {
    message:
      '"WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION" should be strictly lower than "WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION"',
  })
  @ValidateIf((env) => env.WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION > 0)
  WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION = 7;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Workspace,
    description: 'Workspace inactive days before deletion',
  })
  @CastToPositiveNumber()
  @IsNumber()
  @ValidateIf((env) => env.WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION > 0)
  WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION = 14;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Workspace,
    description: 'Maximum number of workspaces deleted per execution',
  })
  @CastToPositiveNumber()
  @IsNumber()
  @ValidateIf((env) => env.MAX_NUMBER_OF_WORKSPACES_DELETED_PER_EXECUTION > 0)
  MAX_NUMBER_OF_WORKSPACES_DELETED_PER_EXECUTION = 5;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.QueueConfig,
    description: 'Queue driver type',
  })
  MESSAGE_QUEUE_TYPE: string = MessageQueueDriverType.BullMQ;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.QueueConfig,
    description: 'Workflow execution throttle limit',
  })
  @CastToPositiveNumber()
  WORKFLOW_EXEC_THROTTLE_LIMIT = 10;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.QueueConfig,
    description: 'Workflow execution throttle TTL',
  })
  // milliseconds
  @CastToPositiveNumber()
  WORKFLOW_EXEC_THROTTLE_TTL = 1000;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Security,
    description: 'Captcha driver type',
  })
  @IsEnum(CaptchaDriverType)
  @IsOptional()
  CAPTCHA_DRIVER?: CaptchaDriverType;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Security,
    sensitive: true,
    description: 'Captcha site key',
  })
  @IsString()
  @IsOptional()
  CAPTCHA_SITE_KEY?: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Security,
    sensitive: true,
    description: 'Captcha secret key',
  })
  @IsString()
  @IsOptional()
  CAPTCHA_SECRET_KEY?: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Security,
    sensitive: true,
    description: 'Enterprise key',
  })
  @IsString()
  @IsOptional()
  ENTERPRISE_KEY: string;
}

export const validate = (
  config: Record<string, unknown>,
): EnvironmentVariables => {
  const validatedConfig = plainToClass(EnvironmentVariables, config);

  const errors = validateSync(validatedConfig, { strictGroups: true });

  const warnings = validateSync(validatedConfig, { groups: ['warning'] });

  if (warnings.length > 0) {
    warnings.forEach((warning) => {
      if (warning.constraints && warning.property) {
        Object.values(warning.constraints).forEach((message) => {
          Logger.warn(message);
        });
      }
    });
  }

  assert(!errors.length, errors.toString());

  return validatedConfig;
};
