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
  ValidateIf,
  validateSync,
} from 'class-validator';

import { EmailDriver } from 'src/engine/core-modules/email/interfaces/email.interface';
import { AwsRegion } from 'src/engine/core-modules/environment/interfaces/aws-region.interface';
import { NodeEnvironment } from 'src/engine/core-modules/environment/interfaces/node-environment.interface';
import { SupportDriver } from 'src/engine/core-modules/environment/interfaces/support.interface';
import { LLMChatModelDriver } from 'src/engine/core-modules/llm-chat-model/interfaces/llm-chat-model.interface';
import { LLMTracingDriver } from 'src/engine/core-modules/llm-tracing/interfaces/llm-tracing.interface';

import { CaptchaDriverType } from 'src/engine/core-modules/captcha/interfaces';
import { CastToBoolean } from 'src/engine/core-modules/environment/decorators/cast-to-boolean.decorator';
import { CastToLogLevelArray } from 'src/engine/core-modules/environment/decorators/cast-to-log-level-array.decorator';
import { CastToPositiveNumber } from 'src/engine/core-modules/environment/decorators/cast-to-positive-number.decorator';
import { EnvironmentVariablesMetadata } from 'src/engine/core-modules/environment/decorators/environment-variables-metadata.decorator';
import { IsAWSRegion } from 'src/engine/core-modules/environment/decorators/is-aws-region.decorator';
import { IsDuration } from 'src/engine/core-modules/environment/decorators/is-duration.decorator';
import { IsStrictlyLowerThan } from 'src/engine/core-modules/environment/decorators/is-strictly-lower-than.decorator';
import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';
import { ExceptionHandlerDriver } from 'src/engine/core-modules/exception-handler/interfaces';
import { StorageDriverType } from 'src/engine/core-modules/file-storage/interfaces';
import { LoggerDriverType } from 'src/engine/core-modules/logger/interfaces';
import { ServerlessDriverType } from 'src/engine/core-modules/serverless/serverless.interface';
import { assert } from 'src/utils/assert';

export class EnvironmentVariables {
  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Other,
    description: 'Enable or disable password authentication for users',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  AUTH_PASSWORD_ENABLED = true;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Other,
    description:
      'Prefills tim@apple.dev in the login form, used in local development for quicker sign-in',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  @ValidateIf((env) => env.AUTH_PASSWORD_ENABLED)
  SIGN_IN_PREFILLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Other,
    description: 'Require email verification for user accounts',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  IS_EMAIL_VERIFICATION_REQUIRED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.TokensDuration,
    description: 'Duration for which the email verification token is valid',
  })
  @IsDuration()
  @IsOptional()
  EMAIL_VERIFICATION_TOKEN_EXPIRES_IN = '1h';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.TokensDuration,
    description: 'Duration for which the password reset token is valid',
  })
  @IsDuration()
  @IsOptional()
  PASSWORD_RESET_TOKEN_EXPIRES_IN = '5m';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.GoogleAuth,
    description: 'Enable or disable the Google Calendar integration',
  })
  @CastToBoolean()
  CALENDAR_PROVIDER_GOOGLE_ENABLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.GoogleAuth,
    description: 'Callback URL for Google Auth APIs',
  })
  AUTH_GOOGLE_APIS_CALLBACK_URL: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.GoogleAuth,
    description: 'Enable or disable Google Single Sign-On (SSO)',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  AUTH_GOOGLE_ENABLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.GoogleAuth,
    sensitive: true,
    description: 'Client ID for Google authentication',
  })
  @IsString()
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED)
  AUTH_GOOGLE_CLIENT_ID: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.GoogleAuth,
    sensitive: true,
    description: 'Client secret for Google authentication',
  })
  @IsString()
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED)
  AUTH_GOOGLE_CLIENT_SECRET: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.GoogleAuth,
    sensitive: true,
    description: 'Callback URL for Google authentication',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED)
  AUTH_GOOGLE_CALLBACK_URL: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.GoogleAuth,
    description: 'Enable or disable the Gmail messaging integration',
  })
  @CastToBoolean()
  MESSAGING_PROVIDER_GMAIL_ENABLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.MicrosoftAuth,
    description: 'Enable or disable Microsoft authentication',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  AUTH_MICROSOFT_ENABLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.MicrosoftAuth,
    sensitive: true,
    description: 'Client ID for Microsoft authentication',
  })
  @IsString()
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_CLIENT_ID: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.MicrosoftAuth,
    sensitive: true,
    description: 'Client secret for Microsoft authentication',
  })
  @IsString()
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_CLIENT_SECRET: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.MicrosoftAuth,
    sensitive: true,
    description: 'Callback URL for Microsoft authentication',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_CALLBACK_URL: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.MicrosoftAuth,
    sensitive: true,
    description: 'Callback URL for Microsoft APIs',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_APIS_CALLBACK_URL: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.MicrosoftAuth,
    description: 'Enable or disable the Microsoft messaging integration',
  })
  @CastToBoolean()
  MESSAGING_PROVIDER_MICROSOFT_ENABLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.MicrosoftAuth,
    description: 'Enable or disable the Microsoft Calendar integration',
  })
  @CastToBoolean()
  CALENDAR_PROVIDER_MICROSOFT_ENABLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Other,
    sensitive: true,
    description:
      'Legacy variable to be deprecated when all API Keys expire. Replaced by APP_KEY',
  })
  @IsOptional()
  @IsString()
  ACCESS_TOKEN_SECRET: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.TokensDuration,
    description: 'Duration for which the access token is valid',
  })
  @IsDuration()
  @IsOptional()
  ACCESS_TOKEN_EXPIRES_IN = '30m';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.TokensDuration,
    description: 'Duration for which the refresh token is valid',
  })
  @IsOptional()
  REFRESH_TOKEN_EXPIRES_IN = '60d';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.TokensDuration,
    description: 'Cooldown period for refreshing tokens',
  })
  @IsDuration()
  @IsOptional()
  REFRESH_TOKEN_COOL_DOWN = '1m';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.TokensDuration,
    description: 'Duration for which the login token is valid',
  })
  @IsDuration()
  @IsOptional()
  LOGIN_TOKEN_EXPIRES_IN = '15m';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.TokensDuration,
    description: 'Duration for which the file token is valid',
  })
  @IsDuration()
  @IsOptional()
  FILE_TOKEN_EXPIRES_IN = '1d';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.TokensDuration,
    description: 'Duration for which the invitation token is valid',
  })
  @IsDuration()
  @IsOptional()
  INVITATION_TOKEN_EXPIRES_IN = '30d';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.TokensDuration,
    description: 'Duration for which the short-term token is valid',
  })
  SHORT_TERM_TOKEN_EXPIRES_IN = '5m';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.EmailSettings,
    description: 'Email address used as the sender for outgoing emails',
  })
  EMAIL_FROM_ADDRESS = 'noreply@yourdomain.com';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.EmailSettings,
    description: 'Email address used for system notifications',
  })
  EMAIL_SYSTEM_ADDRESS = 'system@yourdomain.com';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.EmailSettings,
    description: 'Name used in the From header for outgoing emails',
  })
  EMAIL_FROM_NAME = 'Felix from Twenty';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.EmailSettings,
    description: 'Email driver to use for sending emails',
  })
  EMAIL_DRIVER: EmailDriver = EmailDriver.Logger;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.EmailSettings,
    description: 'SMTP host for sending emails',
  })
  EMAIL_SMTP_HOST: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.EmailSettings,
    description: 'SMTP port for sending emails',
  })
  @CastToPositiveNumber()
  EMAIL_SMTP_PORT = 587;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.EmailSettings,
    description: 'SMTP user for authentication',
  })
  EMAIL_SMTP_USER: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.EmailSettings,
    sensitive: true,
    description: 'SMTP password for authentication',
  })
  EMAIL_SMTP_PASSWORD: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.StorageConfig,
    description: 'Type of storage to use (local or S3)',
  })
  @IsEnum(StorageDriverType)
  @IsOptional()
  STORAGE_TYPE: StorageDriverType = StorageDriverType.Local;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.StorageConfig,
    description: 'Local path for storage when using local storage type',
  })
  @IsString()
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.Local)
  STORAGE_LOCAL_PATH = '.local-storage';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.StorageConfig,
    description: 'S3 region for storage when using S3 storage type',
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsAWSRegion()
  STORAGE_S3_REGION: AwsRegion;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.StorageConfig,
    description: 'S3 bucket name for storage when using S3 storage type',
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsString()
  STORAGE_S3_NAME: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.StorageConfig,
    description: 'S3 endpoint for storage when using S3 storage type',
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsString()
  @IsOptional()
  STORAGE_S3_ENDPOINT: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.StorageConfig,
    sensitive: true,
    description:
      'S3 access key ID for authentication when using S3 storage type',
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsString()
  @IsOptional()
  STORAGE_S3_ACCESS_KEY_ID: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.StorageConfig,
    sensitive: true,
    description:
      'S3 secret access key for authentication when using S3 storage type',
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsString()
  @IsOptional()
  STORAGE_S3_SECRET_ACCESS_KEY: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerlessConfig,
    description: 'Type of serverless execution (local or Lambda)',
  })
  @IsEnum(ServerlessDriverType)
  @IsOptional()
  SERVERLESS_TYPE: ServerlessDriverType = ServerlessDriverType.Local;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerlessConfig,
    description: 'Throttle limit for serverless function execution',
  })
  @CastToPositiveNumber()
  SERVERLESS_FUNCTION_EXEC_THROTTLE_LIMIT = 10;

  // milliseconds
  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerlessConfig,
    description: 'Time-to-live for serverless function execution throttle',
  })
  @CastToPositiveNumber()
  SERVERLESS_FUNCTION_EXEC_THROTTLE_TTL = 1000;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerlessConfig,
    description: 'Region for AWS Lambda functions',
  })
  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.Lambda)
  @IsAWSRegion()
  SERVERLESS_LAMBDA_REGION: AwsRegion;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerlessConfig,
    description: 'IAM role for AWS Lambda functions',
  })
  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.Lambda)
  @IsString()
  @IsOptional()
  SERVERLESS_LAMBDA_ROLE: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerlessConfig,
    sensitive: true,
    description: 'Access key ID for AWS Lambda functions',
  })
  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.Lambda)
  @IsString()
  @IsOptional()
  SERVERLESS_LAMBDA_ACCESS_KEY_ID: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerlessConfig,
    sensitive: true,
    description: 'Secret access key for AWS Lambda functions',
  })
  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.Lambda)
  @IsString()
  @IsOptional()
  SERVERLESS_LAMBDA_SECRET_ACCESS_KEY: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.TinybirdConfig,
    description: 'Enable or disable analytics for telemetry',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  ANALYTICS_ENABLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Logging,
    description: 'Enable or disable telemetry logging',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  TELEMETRY_ENABLED = true;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.TinybirdConfig,
    sensitive: true,
    description: 'Ingest token for Tinybird analytics',
  })
  @IsString()
  @ValidateIf((env) => env.ANALYTICS_ENABLED)
  TINYBIRD_INGEST_TOKEN: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.TinybirdConfig,
    sensitive: true,
    description: 'Workspace UUID for Tinybird analytics',
  })
  @IsString()
  @ValidateIf((env) => env.ANALYTICS_ENABLED)
  TINYBIRD_WORKSPACE_UUID: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.TinybirdConfig,
    sensitive: true,
    description: 'JWT token for Tinybird analytics',
  })
  @IsString()
  @ValidateIf((env) => env.ANALYTICS_ENABLED)
  TINYBIRD_GENERATE_JWT_TOKEN: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.BillingConfig,
    description: 'Enable or disable billing features',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  IS_BILLING_ENABLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.BillingConfig,
    description: 'Link required for billing plan',
  })
  @IsString()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_PLAN_REQUIRED_LINK: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.BillingConfig,
    description: 'Duration of free trial with credit card in days',
  })
  @IsNumber()
  @CastToPositiveNumber()
  @IsOptional()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS = 30;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.BillingConfig,
    description: 'Duration of free trial without credit card in days',
  })
  @IsNumber()
  @CastToPositiveNumber()
  @IsOptional()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_FREE_TRIAL_WITHOUT_CREDIT_CARD_DURATION_IN_DAYS = 7;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.BillingConfig,
    sensitive: true,
    description: 'Stripe API key for billing',
  })
  @IsString()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_STRIPE_API_KEY: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.BillingConfig,
    sensitive: true,
    description: 'Stripe webhook secret for billing',
  })
  @IsString()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_STRIPE_WEBHOOK_SECRET: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.BillingConfig,
    sensitive: true,
    description: 'Base plan product ID for Stripe billing',
  })
  @IsString()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_STRIPE_BASE_PLAN_PRODUCT_ID: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    description: 'Domain for the frontend application',
  })
  @IsString()
  @IsOptional()
  FRONT_DOMAIN?: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    description:
      'Default subdomain for the frontend when multi-workspace is enabled',
  })
  @IsString()
  @ValidateIf((env) => env.IS_MULTIWORKSPACE_ENABLED)
  DEFAULT_SUBDOMAIN = 'app';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    description: 'Protocol for the frontend application (http or https)',
  })
  @IsString()
  @IsOptional()
  FRONT_PROTOCOL?: 'http' | 'https' = 'http';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    description: 'Port for the frontend application',
  })
  @CastToPositiveNumber()
  @IsNumber()
  @IsOptional()
  FRONT_PORT?: number;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Other,
    description: 'ID for the Chrome extension',
  })
  @IsString()
  @IsOptional()
  CHROME_EXTENSION_ID: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Logging,
    description: 'Enable or disable buffering for logs before sending',
  })
  @CastToBoolean()
  @IsBoolean()
  @IsOptional()
  LOGGER_IS_BUFFER_ENABLED = true;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Logging,
    description: 'Driver used for handling exceptions (Console or Sentry)',
  })
  @IsEnum(ExceptionHandlerDriver)
  @IsOptional()
  EXCEPTION_HANDLER_DRIVER: ExceptionHandlerDriver =
    ExceptionHandlerDriver.Console;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Logging,
    description: 'Levels of logging to be captured',
  })
  @CastToLogLevelArray()
  @IsOptional()
  LOG_LEVELS: LogLevel[] = ['log', 'error', 'warn'];

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ExceptionHandler,
    description: 'Driver used for logging (only console for now)',
  })
  @IsEnum(LoggerDriverType)
  @IsOptional()
  LOGGER_DRIVER: LoggerDriverType = LoggerDriverType.Console;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ExceptionHandler,
    description: 'Data Source Name (DSN) for Sentry logging',
  })
  @ValidateIf(
    (env) => env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.Sentry,
  )
  @IsString()
  SENTRY_DSN: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ExceptionHandler,
    description: 'Front-end DSN for Sentry logging',
  })
  @ValidateIf(
    (env) => env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.Sentry,
  )
  @IsString()
  SENTRY_FRONT_DSN: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ExceptionHandler,
    description: 'Release version for Sentry logging',
  })
  @ValidateIf(
    (env) => env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.Sentry,
  )
  @IsString()
  @IsOptional()
  SENTRY_RELEASE: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ExceptionHandler,
    description: 'Environment name for Sentry logging',
  })
  @ValidateIf(
    (env) => env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.Sentry,
  )
  @IsString()
  @IsOptional()
  SENTRY_ENVIRONMENT: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.SupportChatConfig,
    description: 'Driver used for support chat integration',
  })
  @IsEnum(SupportDriver)
  @IsOptional()
  SUPPORT_DRIVER: SupportDriver = SupportDriver.None;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.SupportChatConfig,
    sensitive: true,
    description: 'Chat ID for the support front integration',
  })
  @ValidateIf((env) => env.SUPPORT_DRIVER === SupportDriver.Front)
  @IsString()
  SUPPORT_FRONT_CHAT_ID: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.SupportChatConfig,
    sensitive: true,
    description: 'HMAC key for the support front integration',
  })
  @ValidateIf((env) => env.SUPPORT_DRIVER === SupportDriver.Front)
  @IsString()
  SUPPORT_FRONT_HMAC_KEY: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    sensitive: true,
    description: 'Database connection URL',
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
    group: EnvironmentVariablesGroup.ServerConfig,
    description:
      'Allow connections to a database with self-signed certificates',
  })
  @CastToBoolean()
  @IsBoolean()
  @IsOptional()
  PG_SSL_ALLOW_SELF_SIGNED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.TokensDuration,
    description: 'Time-to-live for cache storage in seconds',
  })
  @CastToPositiveNumber()
  CACHE_STORAGE_TTL: number = 3600 * 24 * 7;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    sensitive: true,
    description: 'URL for cache storage (e.g., Redis connection URL)',
  })
  @IsOptional()
  @IsUrl({
    protocols: ['redis'],
    require_tld: false,
    allow_underscores: true,
  })
  REDIS_URL: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    description: 'Node environment (development, production, etc.)',
  })
  @IsEnum(NodeEnvironment)
  @IsString()
  NODE_ENV: NodeEnvironment = NodeEnvironment.production;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    description: 'Port for the backend server',
  })
  @CastToPositiveNumber()
  @IsNumber()
  @IsOptional()
  PORT = 3000;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    description: 'Base URL for the server',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @IsOptional()
  SERVER_URL = 'http://localhost:3000';

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    sensitive: true,
    description: 'Secret key for the application',
  })
  @IsString()
  APP_SECRET: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.RateLimiting,
    description: 'Maximum number of records affected by mutations',
  })
  @CastToPositiveNumber()
  @IsOptional()
  @IsNumber()
  MUTATION_MAXIMUM_AFFECTED_RECORDS = 100;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.RateLimiting,
    description: 'Time-to-live for API rate limiting in milliseconds',
  })
  @CastToPositiveNumber()
  API_RATE_LIMITING_TTL = 100;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.RateLimiting,
    description:
      'Maximum number of requests allowed in the rate limiting window',
  })
  @CastToPositiveNumber()
  API_RATE_LIMITING_LIMIT = 500;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.SSL,
    description: 'Path to the SSL key for enabling HTTPS in local development',
  })
  @IsString()
  @IsOptional()
  SSL_KEY_PATH: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.SSL,
    description:
      'Path to the SSL certificate for enabling HTTPS in local development',
  })
  @IsString()
  @IsOptional()
  SSL_CERT_PATH: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.CloudflareConfig,
    sensitive: true,
    description: 'API key for Cloudflare integration',
  })
  @IsString()
  @ValidateIf((env) => env.CLOUDFLARE_ZONE_ID)
  CLOUDFLARE_API_KEY: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.CloudflareConfig,
    description: 'Zone ID for Cloudflare integration',
  })
  @IsString()
  @ValidateIf((env) => env.CLOUDFLARE_API_KEY)
  CLOUDFLARE_ZONE_ID: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.LLM,
    description: 'Driver for the LLM chat model',
  })
  LLM_CHAT_MODEL_DRIVER: LLMChatModelDriver;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.LLM,
    sensitive: true,
    description: 'API key for OpenAI integration',
  })
  OPENAI_API_KEY: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.LLM,
    sensitive: true,
    description: 'Secret key for Langfuse integration',
  })
  LANGFUSE_SECRET_KEY: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.LLM,
    description: 'Public key for Langfuse integration',
  })
  LANGFUSE_PUBLIC_KEY: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.LLM,
    description: 'Driver for LLM tracing',
  })
  LLM_TRACING_DRIVER: LLMTracingDriver = LLMTracingDriver.Console;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    description: 'Enable or disable multi-workspace support',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  IS_MULTIWORKSPACE_ENABLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Other,
    description:
      'Use as a feature flag for the new permission feature we are working on.',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  PERMISSIONS_ENABLED = false;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Other,
    description:
      'Number of inactive days before sending a deletion warning for workspaces. Used in the workspace deletion cron job to determine when to send warning emails.',
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
    group: EnvironmentVariablesGroup.Other,
    description: 'Number of inactive days before deleting workspaces',
  })
  @CastToPositiveNumber()
  @IsNumber()
  @ValidateIf((env) => env.WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION > 0)
  WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION = 14;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Other,
    description:
      'Maximum number of workspaces that can be deleted in a single execution',
  })
  @CastToPositiveNumber()
  @IsNumber()
  @ValidateIf((env) => env.MAX_NUMBER_OF_WORKSPACES_DELETED_PER_EXECUTION > 0)
  MAX_NUMBER_OF_WORKSPACES_DELETED_PER_EXECUTION = 5;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.RateLimiting,
    description: 'Throttle limit for workflow execution',
  })
  @CastToPositiveNumber()
  WORKFLOW_EXEC_THROTTLE_LIMIT = 10;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.RateLimiting,
    description: 'Time-to-live for workflow execution throttle in milliseconds',
  })
  @CastToPositiveNumber()
  WORKFLOW_EXEC_THROTTLE_TTL = 1000;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.CaptchaConfig,
    description: 'Driver for captcha integration',
  })
  @IsEnum(CaptchaDriverType)
  @IsOptional()
  CAPTCHA_DRIVER?: CaptchaDriverType;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.CaptchaConfig,
    sensitive: true,
    description: 'Site key for captcha integration',
  })
  @IsString()
  @IsOptional()
  CAPTCHA_SITE_KEY?: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.CaptchaConfig,
    sensitive: true,
    description: 'Secret key for captcha integration',
  })
  @IsString()
  @IsOptional()
  CAPTCHA_SECRET_KEY?: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.ServerConfig,
    sensitive: true,
    description: 'License key for the Enterprise version',
  })
  @IsString()
  @IsOptional()
  ENTERPRISE_KEY: string;

  @EnvironmentVariablesMetadata({
    group: EnvironmentVariablesGroup.Other,
    description: 'Health monitoring time window in minutes',
  })
  @IsNumber()
  @CastToPositiveNumber()
  @IsOptional()
  HEALTH_MONITORING_TIME_WINDOW_IN_MINUTES = 5;
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
