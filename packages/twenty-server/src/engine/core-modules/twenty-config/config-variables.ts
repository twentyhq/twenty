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
  ValidationError,
  validateSync,
} from 'class-validator';
import { isDefined } from 'twenty-shared/utils';

import { EmailDriver } from 'src/engine/core-modules/email/interfaces/email.interface';
import { LLMChatModelDriver } from 'src/engine/core-modules/llm-chat-model/interfaces/llm-chat-model.interface';
import { LLMTracingDriver } from 'src/engine/core-modules/llm-tracing/interfaces/llm-tracing.interface';
import { AwsRegion } from 'src/engine/core-modules/twenty-config/interfaces/aws-region.interface';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { SupportDriver } from 'src/engine/core-modules/twenty-config/interfaces/support.interface';

import { CaptchaDriverType } from 'src/engine/core-modules/captcha/interfaces';
import { ExceptionHandlerDriver } from 'src/engine/core-modules/exception-handler/interfaces';
import { StorageDriverType } from 'src/engine/core-modules/file-storage/interfaces';
import { LoggerDriverType } from 'src/engine/core-modules/logger/interfaces';
import { MeterDriver } from 'src/engine/core-modules/metrics/types/meter-driver.type';
import { ServerlessDriverType } from 'src/engine/core-modules/serverless/serverless.interface';
import { CastToBoolean } from 'src/engine/core-modules/twenty-config/decorators/cast-to-boolean.decorator';
import { CastToLogLevelArray } from 'src/engine/core-modules/twenty-config/decorators/cast-to-log-level-array.decorator';
import { CastToMeterDriverArray } from 'src/engine/core-modules/twenty-config/decorators/cast-to-meter-driver.decorator';
import { CastToPositiveNumber } from 'src/engine/core-modules/twenty-config/decorators/cast-to-positive-number.decorator';
import { ConfigVariablesMetadata } from 'src/engine/core-modules/twenty-config/decorators/config-variables-metadata.decorator';
import { IsAWSRegion } from 'src/engine/core-modules/twenty-config/decorators/is-aws-region.decorator';
import { IsDuration } from 'src/engine/core-modules/twenty-config/decorators/is-duration.decorator';
import { IsOptionalOrEmptyString } from 'src/engine/core-modules/twenty-config/decorators/is-optional-or-empty-string.decorator';
import { IsStrictlyLowerThan } from 'src/engine/core-modules/twenty-config/decorators/is-strictly-lower-than.decorator';
import { IsTwentySemVer } from 'src/engine/core-modules/twenty-config/decorators/is-twenty-semver.decorator';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';

export class ConfigVariables {
  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description: 'Enable or disable password authentication for users',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  AUTH_PASSWORD_ENABLED = true;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description:
      'Prefills tim@apple.dev in the login form, used in local development for quicker sign-in',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  @ValidateIf((env) => env.AUTH_PASSWORD_ENABLED)
  SIGN_IN_PREFILLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description: 'Require email verification for user accounts',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  IS_EMAIL_VERIFICATION_REQUIRED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Duration for which the email verification token is valid',
  })
  @IsDuration()
  @IsOptional()
  EMAIL_VERIFICATION_TOKEN_EXPIRES_IN = '1h';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Duration for which the password reset token is valid',
  })
  @IsDuration()
  @IsOptional()
  PASSWORD_RESET_TOKEN_EXPIRES_IN = '5m';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.GoogleAuth,
    description: 'Enable or disable the Google Calendar integration',
  })
  @CastToBoolean()
  CALENDAR_PROVIDER_GOOGLE_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.GoogleAuth,
    description: 'Callback URL for Google Auth APIs',
  })
  AUTH_GOOGLE_APIS_CALLBACK_URL: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.GoogleAuth,
    description: 'Enable or disable Google Single Sign-On (SSO)',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  AUTH_GOOGLE_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.GoogleAuth,
    isSensitive: true,
    description: 'Client ID for Google authentication',
  })
  @IsString()
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED)
  AUTH_GOOGLE_CLIENT_ID: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.GoogleAuth,
    isSensitive: true,
    description: 'Client secret for Google authentication',
  })
  @IsString()
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED)
  AUTH_GOOGLE_CLIENT_SECRET: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.GoogleAuth,
    isSensitive: true,
    description: 'Callback URL for Google authentication',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED)
  AUTH_GOOGLE_CALLBACK_URL: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.GoogleAuth,
    description: 'Enable or disable the Gmail messaging integration',
  })
  @CastToBoolean()
  MESSAGING_PROVIDER_GMAIL_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.MicrosoftAuth,
    description: 'Enable or disable Microsoft authentication',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  AUTH_MICROSOFT_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.MicrosoftAuth,
    isSensitive: true,
    description: 'Client ID for Microsoft authentication',
  })
  @IsString()
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_CLIENT_ID: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.MicrosoftAuth,
    isSensitive: true,
    description: 'Client secret for Microsoft authentication',
  })
  @IsString()
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_CLIENT_SECRET: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.MicrosoftAuth,
    isSensitive: true,
    description: 'Callback URL for Microsoft authentication',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_CALLBACK_URL: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.MicrosoftAuth,
    isSensitive: true,
    description: 'Callback URL for Microsoft APIs',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_APIS_CALLBACK_URL: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.MicrosoftAuth,
    description: 'Enable or disable the Microsoft messaging integration',
  })
  @CastToBoolean()
  MESSAGING_PROVIDER_MICROSOFT_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.MicrosoftAuth,
    description: 'Enable or disable the Microsoft Calendar integration',
  })
  @CastToBoolean()
  CALENDAR_PROVIDER_MICROSOFT_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    isSensitive: true,
    description:
      'Legacy variable to be deprecated when all API Keys expire. Replaced by APP_KEY',
  })
  @IsOptional()
  @IsString()
  ACCESS_TOKEN_SECRET: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Duration for which the access token is valid',
  })
  @IsDuration()
  @IsOptional()
  ACCESS_TOKEN_EXPIRES_IN = '30m';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Duration for which the refresh token is valid',
  })
  @IsOptional()
  REFRESH_TOKEN_EXPIRES_IN = '60d';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Cooldown period for refreshing tokens',
  })
  @IsDuration()
  @IsOptional()
  REFRESH_TOKEN_COOL_DOWN = '1m';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Duration for which the login token is valid',
  })
  @IsDuration()
  @IsOptional()
  LOGIN_TOKEN_EXPIRES_IN = '15m';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Duration for which the file token is valid',
  })
  @IsDuration()
  @IsOptional()
  FILE_TOKEN_EXPIRES_IN = '1d';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Duration for which the invitation token is valid',
  })
  @IsDuration()
  @IsOptional()
  INVITATION_TOKEN_EXPIRES_IN = '30d';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Duration for which the short-term token is valid',
  })
  SHORT_TERM_TOKEN_EXPIRES_IN = '5m';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.EmailSettings,
    description: 'Email address used as the sender for outgoing emails',
  })
  EMAIL_FROM_ADDRESS = 'noreply@yourdomain.com';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.EmailSettings,
    description: 'Email address used for system notifications',
  })
  EMAIL_SYSTEM_ADDRESS = 'system@yourdomain.com';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.EmailSettings,
    description: 'Name used in the From header for outgoing emails',
  })
  EMAIL_FROM_NAME = 'Felix from Twenty';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.EmailSettings,
    description: 'Email driver to use for sending emails',
  })
  EMAIL_DRIVER: EmailDriver = EmailDriver.Logger;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.EmailSettings,
    description: 'SMTP host for sending emails',
  })
  EMAIL_SMTP_HOST: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.EmailSettings,
    description: 'Use unsecure connection for SMTP',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  EMAIL_SMTP_NO_TLS = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.EmailSettings,
    description: 'SMTP port for sending emails',
  })
  @CastToPositiveNumber()
  EMAIL_SMTP_PORT = 587;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.EmailSettings,
    description: 'SMTP user for authentication',
  })
  EMAIL_SMTP_USER: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.EmailSettings,
    isSensitive: true,
    description: 'SMTP password for authentication',
  })
  EMAIL_SMTP_PASSWORD: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.StorageConfig,
    description: 'Type of storage to use (local or S3)',
  })
  @IsEnum(StorageDriverType)
  @IsOptional()
  STORAGE_TYPE: StorageDriverType = StorageDriverType.Local;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.StorageConfig,
    description: 'Local path for storage when using local storage type',
  })
  @IsString()
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.Local)
  STORAGE_LOCAL_PATH = '.local-storage';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.StorageConfig,
    description: 'S3 region for storage when using S3 storage type',
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsAWSRegion()
  STORAGE_S3_REGION: AwsRegion;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.StorageConfig,
    description: 'S3 bucket name for storage when using S3 storage type',
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsString()
  STORAGE_S3_NAME: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.StorageConfig,
    description: 'S3 endpoint for storage when using S3 storage type',
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsString()
  @IsOptional()
  STORAGE_S3_ENDPOINT: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.StorageConfig,
    isSensitive: true,
    description:
      'S3 access key ID for authentication when using S3 storage type',
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsString()
  @IsOptional()
  STORAGE_S3_ACCESS_KEY_ID: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.StorageConfig,
    isSensitive: true,
    description:
      'S3 secret access key for authentication when using S3 storage type',
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsString()
  @IsOptional()
  STORAGE_S3_SECRET_ACCESS_KEY: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerlessConfig,
    description: 'Type of serverless execution (local or Lambda)',
  })
  @IsEnum(ServerlessDriverType)
  @IsOptional()
  SERVERLESS_TYPE: ServerlessDriverType = ServerlessDriverType.Local;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerlessConfig,
    description: 'Throttle limit for serverless function execution',
  })
  @CastToPositiveNumber()
  SERVERLESS_FUNCTION_EXEC_THROTTLE_LIMIT = 10;

  // milliseconds
  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerlessConfig,
    description: 'Time-to-live for serverless function execution throttle',
  })
  @CastToPositiveNumber()
  SERVERLESS_FUNCTION_EXEC_THROTTLE_TTL = 1000;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerlessConfig,
    description: 'Region for AWS Lambda functions',
  })
  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.Lambda)
  @IsAWSRegion()
  SERVERLESS_LAMBDA_REGION: AwsRegion;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerlessConfig,
    description: 'IAM role for AWS Lambda functions',
  })
  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.Lambda)
  @IsString()
  SERVERLESS_LAMBDA_ROLE: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerlessConfig,
    description: 'Role to assume when hosting lambdas in dedicated AWS account',
  })
  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.Lambda)
  @IsString()
  @IsOptional()
  SERVERLESS_LAMBDA_SUBHOSTING_ROLE?: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerlessConfig,
    isSensitive: true,
    description: 'Access key ID for AWS Lambda functions',
  })
  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.Lambda)
  @IsString()
  @IsOptional()
  SERVERLESS_LAMBDA_ACCESS_KEY_ID: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerlessConfig,
    isSensitive: true,
    description: 'Secret access key for AWS Lambda functions',
  })
  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.Lambda)
  @IsString()
  @IsOptional()
  SERVERLESS_LAMBDA_SECRET_ACCESS_KEY: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.AnalyticsConfig,
    description: 'Enable or disable analytics for telemetry',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  ANALYTICS_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.AnalyticsConfig,
    description: 'Clickhouse host for analytics',
  })
  @IsOptional()
  @IsUrl({
    require_tld: false,
    allow_underscores: true,
  })
  @ValidateIf((env) => env.ANALYTICS_ENABLED === true)
  CLICKHOUSE_URL: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Logging,
    description: 'Enable or disable telemetry logging',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  TELEMETRY_ENABLED = true;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.BillingConfig,
    description: 'Enable or disable billing features',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  IS_BILLING_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.BillingConfig,
    description: 'Link required for billing plan',
  })
  @IsString()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_PLAN_REQUIRED_LINK: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.BillingConfig,
    description: 'Duration of free trial with credit card in days',
  })
  @IsNumber()
  @CastToPositiveNumber()
  @IsOptional()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS = 30;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.BillingConfig,
    description: 'Duration of free trial without credit card in days',
  })
  @IsNumber()
  @CastToPositiveNumber()
  @IsOptional()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_FREE_TRIAL_WITHOUT_CREDIT_CARD_DURATION_IN_DAYS = 7;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.BillingConfig,
    description: 'Amount of money in cents to trigger a billing threshold',
  })
  @IsNumber()
  @CastToPositiveNumber()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_SUBSCRIPTION_THRESHOLD_AMOUNT = 10000;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.BillingConfig,
    description: 'Amount of credits for the free trial without credit card',
  })
  @IsNumber()
  @CastToPositiveNumber()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_FREE_WORKFLOW_CREDITS_FOR_TRIAL_PERIOD_WITHOUT_CREDIT_CARD = 5000;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.BillingConfig,
    description: 'Amount of credits for the free trial with credit card',
  })
  @IsNumber()
  @CastToPositiveNumber()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_FREE_WORKFLOW_CREDITS_FOR_TRIAL_PERIOD_WITH_CREDIT_CARD = 10000;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.BillingConfig,
    isSensitive: true,
    description: 'Stripe API key for billing',
  })
  @IsString()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_STRIPE_API_KEY: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.BillingConfig,
    isSensitive: true,
    description: 'Stripe webhook secret for billing',
  })
  @IsString()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_STRIPE_WEBHOOK_SECRET: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description: 'Url for the frontend application',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @IsOptional()
  FRONTEND_URL: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description:
      'Default subdomain for the frontend when multi-workspace is enabled',
  })
  @IsString()
  @ValidateIf((env) => env.IS_MULTIWORKSPACE_ENABLED)
  DEFAULT_SUBDOMAIN = 'app';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description: 'ID for the Chrome extension',
  })
  @IsString()
  @IsOptional()
  CHROME_EXTENSION_ID: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Logging,
    description: 'Enable or disable buffering for logs before sending',
  })
  @CastToBoolean()
  @IsBoolean()
  @IsOptional()
  LOGGER_IS_BUFFER_ENABLED = true;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Logging,
    description: 'Driver used for handling exceptions (Console or Sentry)',
  })
  @IsEnum(ExceptionHandlerDriver)
  @IsOptional()
  EXCEPTION_HANDLER_DRIVER: ExceptionHandlerDriver =
    ExceptionHandlerDriver.Console;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Logging,
    description: 'Levels of logging to be captured',
  })
  @CastToLogLevelArray()
  @IsOptional()
  LOG_LEVELS: LogLevel[] = ['log', 'error', 'warn'];

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Metering,
    description: 'Driver used for collect metrics (OpenTelemetry or Console)',
  })
  @CastToMeterDriverArray()
  @IsOptional()
  METER_DRIVER: MeterDriver[] = [];

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Metering,
    description: 'Endpoint URL for the OpenTelemetry collector',
  })
  @IsOptional()
  OTLP_COLLECTOR_ENDPOINT_URL: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ExceptionHandler,
    description: 'Driver used for logging (only console for now)',
  })
  @IsEnum(LoggerDriverType)
  @IsOptional()
  LOGGER_DRIVER: LoggerDriverType = LoggerDriverType.Console;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ExceptionHandler,
    description: 'Data Source Name (DSN) for Sentry logging',
  })
  @ValidateIf(
    (env) => env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.Sentry,
  )
  @IsString()
  SENTRY_DSN: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ExceptionHandler,
    description: 'Front-end DSN for Sentry logging',
  })
  @ValidateIf(
    (env) => env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.Sentry,
  )
  @IsString()
  SENTRY_FRONT_DSN: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ExceptionHandler,
    description: 'Environment name for Sentry logging',
  })
  @ValidateIf(
    (env) => env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.Sentry,
  )
  @IsString()
  @IsOptional()
  SENTRY_ENVIRONMENT: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.SupportChatConfig,
    description: 'Driver used for support chat integration',
  })
  @IsEnum(SupportDriver)
  @IsOptional()
  SUPPORT_DRIVER: SupportDriver = SupportDriver.None;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.SupportChatConfig,
    isSensitive: true,
    description: 'Chat ID for the support front integration',
  })
  @ValidateIf((env) => env.SUPPORT_DRIVER === SupportDriver.Front)
  @IsString()
  SUPPORT_FRONT_CHAT_ID: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.SupportChatConfig,
    isSensitive: true,
    description: 'HMAC key for the support front integration',
  })
  @ValidateIf((env) => env.SUPPORT_DRIVER === SupportDriver.Front)
  @IsString()
  SUPPORT_FRONT_HMAC_KEY: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    isSensitive: true,
    description: 'Database connection URL',
  })
  @IsDefined()
  @IsUrl({
    protocols: ['postgres', 'postgresql'],
    require_tld: false,
    allow_underscores: true,
    require_host: false,
  })
  PG_DATABASE_URL: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description:
      'Allow connections to a database with self-signed certificates',
  })
  @CastToBoolean()
  @IsBoolean()
  @IsOptional()
  PG_SSL_ALLOW_SELF_SIGNED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description: 'Enable configuration variables to be stored in the database',
  })
  @CastToBoolean()
  @IsBoolean()
  @IsOptional()
  IS_CONFIG_VARIABLES_IN_DB_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Time-to-live for cache storage in seconds',
  })
  @CastToPositiveNumber()
  CACHE_STORAGE_TTL: number = 3600 * 24 * 7;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    isSensitive: true,
    description: 'URL for cache storage (e.g., Redis connection URL)',
  })
  @IsOptional()
  @IsUrl({
    protocols: ['redis', 'rediss'],
    require_tld: false,
    allow_underscores: true,
  })
  REDIS_URL: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description: 'Node environment (development, production, etc.)',
  })
  @IsEnum(NodeEnvironment)
  @IsString()
  NODE_ENV: NodeEnvironment = NodeEnvironment.production;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description: 'Port for the node server',
  })
  @CastToPositiveNumber()
  @IsNumber()
  @IsOptional()
  NODE_PORT = 3000;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description: 'Base URL for the server',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @IsOptional()
  SERVER_URL = 'http://localhost:3000';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    isSensitive: true,
    description: 'Secret key for the application',
  })
  @IsString()
  APP_SECRET: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.RateLimiting,
    description: 'Maximum number of records affected by mutations',
  })
  @CastToPositiveNumber()
  @IsOptional()
  @IsNumber()
  MUTATION_MAXIMUM_AFFECTED_RECORDS = 100;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.RateLimiting,
    description: 'Time-to-live for API rate limiting in milliseconds',
  })
  @CastToPositiveNumber()
  API_RATE_LIMITING_TTL = 100;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.RateLimiting,
    description:
      'Maximum number of requests allowed in the rate limiting window',
  })
  @CastToPositiveNumber()
  API_RATE_LIMITING_LIMIT = 500;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.SSL,
    description: 'Path to the SSL key for enabling HTTPS in local development',
  })
  @IsString()
  @IsOptional()
  SSL_KEY_PATH: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.SSL,
    description:
      'Path to the SSL certificate for enabling HTTPS in local development',
  })
  @IsString()
  @IsOptional()
  SSL_CERT_PATH: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.CloudflareConfig,
    isSensitive: true,
    description: 'API key for Cloudflare integration',
  })
  @IsString()
  @ValidateIf((env) => env.CLOUDFLARE_ZONE_ID)
  CLOUDFLARE_API_KEY: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.CloudflareConfig,
    description: 'Zone ID for Cloudflare integration',
  })
  @IsString()
  @ValidateIf((env) => env.CLOUDFLARE_API_KEY)
  CLOUDFLARE_ZONE_ID: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description: 'Random string to validate queries from Cloudflare',
  })
  @IsString()
  @IsOptional()
  CLOUDFLARE_WEBHOOK_SECRET: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.LLM,
    description: 'Driver for the LLM chat model',
  })
  LLM_CHAT_MODEL_DRIVER: LLMChatModelDriver;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.LLM,
    isSensitive: true,
    description: 'API key for OpenAI integration',
  })
  OPENAI_API_KEY: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.LLM,
    isSensitive: true,
    description: 'Secret key for Langfuse integration',
  })
  LANGFUSE_SECRET_KEY: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.LLM,
    description: 'Public key for Langfuse integration',
  })
  LANGFUSE_PUBLIC_KEY: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.LLM,
    description: 'Driver for LLM tracing',
  })
  LLM_TRACING_DRIVER: LLMTracingDriver = LLMTracingDriver.Console;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description: 'Enable or disable multi-workspace support',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  IS_MULTIWORKSPACE_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description:
      'Number of inactive days before sending a deletion warning for workspaces. Used in the workspace deletion cron job to determine when to send warning emails.',
  })
  @CastToPositiveNumber()
  @IsNumber()
  @IsStrictlyLowerThan('WORKSPACE_INACTIVE_DAYS_BEFORE_SOFT_DELETION', {
    message:
      '"WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION" should be strictly lower than "WORKSPACE_INACTIVE_DAYS_BEFORE_SOFT_DELETION"',
  })
  WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION = 7;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description: 'Number of inactive days before soft deleting workspaces',
  })
  @CastToPositiveNumber()
  @IsNumber()
  @IsStrictlyLowerThan('WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION', {
    message:
      '"WORKSPACE_INACTIVE_DAYS_BEFORE_SOFT_DELETION" should be strictly lower than "WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION"',
  })
  WORKSPACE_INACTIVE_DAYS_BEFORE_SOFT_DELETION = 14;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description: 'Number of inactive days before deleting workspaces',
  })
  @CastToPositiveNumber()
  @IsNumber()
  WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION = 21;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description:
      'Maximum number of workspaces that can be deleted in a single execution',
  })
  @CastToPositiveNumber()
  @IsNumber()
  @ValidateIf((env) => env.MAX_NUMBER_OF_WORKSPACES_DELETED_PER_EXECUTION > 0)
  MAX_NUMBER_OF_WORKSPACES_DELETED_PER_EXECUTION = 5;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.RateLimiting,
    description: 'Throttle limit for workflow execution',
  })
  @CastToPositiveNumber()
  WORKFLOW_EXEC_THROTTLE_LIMIT = 500;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.RateLimiting,
    description: 'Time-to-live for workflow execution throttle in milliseconds',
  })
  @CastToPositiveNumber()
  WORKFLOW_EXEC_THROTTLE_TTL = 1000;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.CaptchaConfig,
    description: 'Driver for captcha integration',
  })
  @IsEnum(CaptchaDriverType)
  @IsOptional()
  CAPTCHA_DRIVER?: CaptchaDriverType;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.CaptchaConfig,
    isSensitive: true,
    description: 'Site key for captcha integration',
  })
  @IsString()
  @IsOptional()
  CAPTCHA_SITE_KEY?: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.CaptchaConfig,
    isSensitive: true,
    description: 'Secret key for captcha integration',
  })
  @IsString()
  @IsOptional()
  CAPTCHA_SECRET_KEY?: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    isSensitive: true,
    description: 'License key for the Enterprise version',
  })
  @IsString()
  @IsOptional()
  ENTERPRISE_KEY: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description: 'Health monitoring time window in minutes',
  })
  @IsNumber()
  @CastToPositiveNumber()
  @IsOptional()
  HEALTH_METRICS_TIME_WINDOW_IN_MINUTES = 5;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description: 'Enable or disable the attachment preview feature',
  })
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  IS_ATTACHMENT_PREVIEW_ENABLED = true;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description: 'Twenty server version',
  })
  @IsOptionalOrEmptyString()
  @IsTwentySemVer()
  APP_VERSION?: string;
}

export const validate = (config: Record<string, unknown>): ConfigVariables => {
  const validatedConfig = plainToClass(ConfigVariables, config);

  const validationErrors = validateSync(validatedConfig, {
    strictGroups: true,
  });

  const validationWarnings = validateSync(validatedConfig, {
    groups: ['warning'],
  });
  const logValidatonErrors = (
    errorCollection: ValidationError[],
    type: 'error' | 'warn',
  ) =>
    errorCollection.forEach((error) => {
      if (!isDefined(error.constraints) || !isDefined(error.property)) {
        return;
      }
      Logger[type](Object.values(error.constraints).join('\n'));
    });

  if (validationWarnings.length > 0) {
    logValidatonErrors(validationWarnings, 'warn');
  }

  if (validationErrors.length > 0) {
    logValidatonErrors(validationErrors, 'error');
    throw new Error('Config variables validation failed');
  }

  return validatedConfig;
};
