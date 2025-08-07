import { LogLevel, Logger } from '@nestjs/common';

import { plainToClass } from 'class-transformer';
import {
  IsDefined,
  IsOptional,
  IsUrl,
  ValidateIf,
  ValidationError,
  validateSync,
} from 'class-validator';
import { isDefined } from 'twenty-shared/utils';

import { AwsRegion } from 'src/engine/core-modules/twenty-config/interfaces/aws-region.interface';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { SupportDriver } from 'src/engine/core-modules/twenty-config/interfaces/support.interface';

import { CaptchaDriverType } from 'src/engine/core-modules/captcha/interfaces';
import { EmailDriver } from 'src/engine/core-modules/email/enums/email-driver.enum';
import { ExceptionHandlerDriver } from 'src/engine/core-modules/exception-handler/interfaces';
import { StorageDriverType } from 'src/engine/core-modules/file-storage/interfaces';
import { LoggerDriverType } from 'src/engine/core-modules/logger/interfaces';
import { MeterDriver } from 'src/engine/core-modules/metrics/types/meter-driver.type';
import { ServerlessDriverType } from 'src/engine/core-modules/serverless/serverless.interface';
import { CastToLogLevelArray } from 'src/engine/core-modules/twenty-config/decorators/cast-to-log-level-array.decorator';
import { CastToMeterDriverArray } from 'src/engine/core-modules/twenty-config/decorators/cast-to-meter-driver.decorator';
import { CastToPositiveNumber } from 'src/engine/core-modules/twenty-config/decorators/cast-to-positive-number.decorator';
import { CastToUpperSnakeCase } from 'src/engine/core-modules/twenty-config/decorators/cast-to-upper-snake-case.decorator';
import { ConfigVariablesMetadata } from 'src/engine/core-modules/twenty-config/decorators/config-variables-metadata.decorator';
import { IsAWSRegion } from 'src/engine/core-modules/twenty-config/decorators/is-aws-region.decorator';
import { IsDuration } from 'src/engine/core-modules/twenty-config/decorators/is-duration.decorator';
import { IsOptionalOrEmptyString } from 'src/engine/core-modules/twenty-config/decorators/is-optional-or-empty-string.decorator';
import { IsStrictlyLowerThan } from 'src/engine/core-modules/twenty-config/decorators/is-strictly-lower-than.decorator';
import { IsTwentySemVer } from 'src/engine/core-modules/twenty-config/decorators/is-twenty-semver.decorator';
import { ConfigVariableType } from 'src/engine/core-modules/twenty-config/enums/config-variable-type.enum';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import {
  ConfigVariableException,
  ConfigVariableExceptionCode,
} from 'src/engine/core-modules/twenty-config/twenty-config.exception';

export class ConfigVariables {
  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description: 'Enable or disable password authentication for users',
    type: ConfigVariableType.BOOLEAN,
  })
  @IsOptional()
  AUTH_PASSWORD_ENABLED = true;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description:
      'Prefills tim@apple.dev in the login form, used in local development for quicker sign-in',
    type: ConfigVariableType.BOOLEAN,
  })
  @IsOptional()
  @ValidateIf((env) => env.AUTH_PASSWORD_ENABLED)
  SIGN_IN_PREFILLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description: 'Require email verification for user accounts',
    type: ConfigVariableType.BOOLEAN,
  })
  @IsOptional()
  IS_EMAIL_VERIFICATION_REQUIRED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Duration for which the email verification token is valid',
    type: ConfigVariableType.STRING,
  })
  @IsDuration()
  @IsOptional()
  EMAIL_VERIFICATION_TOKEN_EXPIRES_IN = '1h';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Duration for which the password reset token is valid',
    type: ConfigVariableType.STRING,
  })
  @IsDuration()
  @IsOptional()
  PASSWORD_RESET_TOKEN_EXPIRES_IN = '5m';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.GoogleAuth,
    description: 'Enable or disable the Google Calendar integration',
    type: ConfigVariableType.BOOLEAN,
  })
  CALENDAR_PROVIDER_GOOGLE_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.GoogleAuth,
    description: 'Callback URL for Google Auth APIs',
    type: ConfigVariableType.STRING,
    isSensitive: false,
  })
  AUTH_GOOGLE_APIS_CALLBACK_URL: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.GoogleAuth,
    description: 'Enable or disable Google Single Sign-On (SSO)',
    type: ConfigVariableType.BOOLEAN,
  })
  @IsOptional()
  AUTH_GOOGLE_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.GoogleAuth,
    isSensitive: false,
    description: 'Client ID for Google authentication',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED)
  AUTH_GOOGLE_CLIENT_ID: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.GoogleAuth,
    isSensitive: true,
    description: 'Client secret for Google authentication',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED)
  AUTH_GOOGLE_CLIENT_SECRET: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.GoogleAuth,
    isSensitive: false,
    description: 'Callback URL for Google authentication',
    type: ConfigVariableType.STRING,
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED)
  AUTH_GOOGLE_CALLBACK_URL: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.GoogleAuth,
    description: 'Enable or disable the Gmail messaging integration',
    type: ConfigVariableType.BOOLEAN,
  })
  MESSAGING_PROVIDER_GMAIL_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description: 'Enable or disable the IMAP messaging integration',
    type: ConfigVariableType.BOOLEAN,
  })
  IS_IMAP_SMTP_CALDAV_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.MicrosoftAuth,
    description: 'Enable or disable Microsoft authentication',
    type: ConfigVariableType.BOOLEAN,
  })
  @IsOptional()
  AUTH_MICROSOFT_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.MicrosoftAuth,
    isSensitive: false,
    description: 'Client ID for Microsoft authentication',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_CLIENT_ID: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.MicrosoftAuth,
    isSensitive: true,
    description: 'Client secret for Microsoft authentication',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_CLIENT_SECRET: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.MicrosoftAuth,
    isSensitive: false,
    description: 'Callback URL for Microsoft authentication',
    type: ConfigVariableType.STRING,
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_CALLBACK_URL: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.MicrosoftAuth,
    isSensitive: false,
    description: 'Callback URL for Microsoft APIs',
    type: ConfigVariableType.STRING,
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_APIS_CALLBACK_URL: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.MicrosoftAuth,
    description: 'Enable or disable the Microsoft messaging integration',
    type: ConfigVariableType.BOOLEAN,
  })
  MESSAGING_PROVIDER_MICROSOFT_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.MicrosoftAuth,
    description: 'Enable or disable the Microsoft Calendar integration',
    type: ConfigVariableType.BOOLEAN,
  })
  CALENDAR_PROVIDER_MICROSOFT_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    isSensitive: true,
    description:
      'Legacy variable to be deprecated when all API Keys expire. Replaced by APP_KEY',
    type: ConfigVariableType.STRING,
    isEnvOnly: true,
  })
  @IsOptional()
  ACCESS_TOKEN_SECRET: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Duration for which the access token is valid',
    type: ConfigVariableType.STRING,
  })
  @IsDuration()
  @IsOptional()
  ACCESS_TOKEN_EXPIRES_IN = '30m';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Duration for which the workspace agnostic token is valid',
    type: ConfigVariableType.STRING,
  })
  @IsDuration()
  @IsOptional()
  WORKSPACE_AGNOSTIC_TOKEN_EXPIRES_IN = '30m';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Duration for which the refresh token is valid',
    type: ConfigVariableType.STRING,
  })
  @IsOptional()
  REFRESH_TOKEN_EXPIRES_IN = '60d';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Cooldown period for refreshing tokens',
    type: ConfigVariableType.STRING,
  })
  @IsDuration()
  @IsOptional()
  REFRESH_TOKEN_COOL_DOWN = '1m';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Duration for which the login token is valid',
    type: ConfigVariableType.STRING,
  })
  @IsDuration()
  @IsOptional()
  LOGIN_TOKEN_EXPIRES_IN = '15m';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Duration for which the file token is valid',
    type: ConfigVariableType.STRING,
  })
  @IsDuration()
  @IsOptional()
  FILE_TOKEN_EXPIRES_IN = '1d';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Duration for which the invitation token is valid',
    type: ConfigVariableType.STRING,
  })
  @IsDuration()
  @IsOptional()
  INVITATION_TOKEN_EXPIRES_IN = '30d';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Duration for which the short-term token is valid',
    type: ConfigVariableType.STRING,
  })
  SHORT_TERM_TOKEN_EXPIRES_IN = '5m';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.EmailSettings,
    description: 'Email address used as the sender for outgoing emails',
    type: ConfigVariableType.STRING,
  })
  EMAIL_FROM_ADDRESS = 'noreply@yourdomain.com';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.EmailSettings,
    description: 'Email address used for system notifications',
    type: ConfigVariableType.STRING,
  })
  EMAIL_SYSTEM_ADDRESS = 'system@yourdomain.com';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.EmailSettings,
    description: 'Name used in the From header for outgoing emails',
    type: ConfigVariableType.STRING,
  })
  EMAIL_FROM_NAME = 'Felix from Twenty';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.EmailSettings,
    description: 'Email driver to use for sending emails',
    type: ConfigVariableType.ENUM,
    options: Object.values(EmailDriver),
  })
  @CastToUpperSnakeCase()
  EMAIL_DRIVER: EmailDriver = EmailDriver.LOGGER;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.EmailSettings,
    description: 'SMTP host for sending emails',
    type: ConfigVariableType.STRING,
  })
  EMAIL_SMTP_HOST: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.EmailSettings,
    description: 'Use unsecure connection for SMTP',
    type: ConfigVariableType.BOOLEAN,
  })
  @IsOptional()
  EMAIL_SMTP_NO_TLS = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.EmailSettings,
    description: 'SMTP port for sending emails',
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  EMAIL_SMTP_PORT = 587;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.EmailSettings,
    description: 'SMTP user for authentication',
    type: ConfigVariableType.STRING,
    isSensitive: true,
  })
  EMAIL_SMTP_USER: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.EmailSettings,
    isSensitive: true,
    description: 'SMTP password for authentication',
    type: ConfigVariableType.STRING,
  })
  EMAIL_SMTP_PASSWORD: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.StorageConfig,
    description: 'Type of storage to use (local or S3)',
    type: ConfigVariableType.ENUM,
    options: Object.values(StorageDriverType),
  })
  @IsOptional()
  @CastToUpperSnakeCase()
  STORAGE_TYPE: StorageDriverType = StorageDriverType.LOCAL;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.StorageConfig,
    description: 'Local path for storage when using local storage type',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.LOCAL)
  STORAGE_LOCAL_PATH = '.local-storage';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.StorageConfig,
    description: 'S3 region for storage when using S3 storage type',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S_3)
  @IsAWSRegion()
  STORAGE_S3_REGION: AwsRegion;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.StorageConfig,
    description: 'S3 bucket name for storage when using S3 storage type',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S_3)
  STORAGE_S3_NAME: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.StorageConfig,
    description: 'S3 endpoint for storage when using S3 storage type',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S_3)
  @IsOptional()
  STORAGE_S3_ENDPOINT: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.StorageConfig,
    isSensitive: true,
    description:
      'S3 access key ID for authentication when using S3 storage type',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S_3)
  @IsOptional()
  STORAGE_S3_ACCESS_KEY_ID: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.StorageConfig,
    isSensitive: true,
    description:
      'S3 secret access key for authentication when using S3 storage type',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S_3)
  @IsOptional()
  STORAGE_S3_SECRET_ACCESS_KEY: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerlessConfig,
    description: 'Type of serverless execution (local or Lambda)',
    type: ConfigVariableType.ENUM,
    options: Object.values(ServerlessDriverType),
    isEnvOnly: true,
  })
  @IsOptional()
  @CastToUpperSnakeCase()
  SERVERLESS_TYPE: ServerlessDriverType = ServerlessDriverType.LOCAL;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerlessConfig,
    description: 'Throttle limit for serverless function execution',
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  SERVERLESS_FUNCTION_EXEC_THROTTLE_LIMIT = 10;

  // milliseconds
  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerlessConfig,
    description: 'Time-to-live for serverless function execution throttle',
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  SERVERLESS_FUNCTION_EXEC_THROTTLE_TTL = 1000;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerlessConfig,
    description: 'Region for AWS Lambda functions',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.LAMBDA)
  @IsAWSRegion()
  SERVERLESS_LAMBDA_REGION: AwsRegion;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerlessConfig,
    description: 'IAM role for AWS Lambda functions',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.LAMBDA)
  SERVERLESS_LAMBDA_ROLE: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerlessConfig,
    description: 'Role to assume when hosting lambdas in dedicated AWS account',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.LAMBDA)
  @IsOptional()
  SERVERLESS_LAMBDA_SUBHOSTING_ROLE?: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerlessConfig,
    isSensitive: true,
    description: 'Access key ID for AWS Lambda functions',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.LAMBDA)
  @IsOptional()
  SERVERLESS_LAMBDA_ACCESS_KEY_ID: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerlessConfig,
    isSensitive: true,
    description: 'Secret access key for AWS Lambda functions',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.LAMBDA)
  @IsOptional()
  SERVERLESS_LAMBDA_SECRET_ACCESS_KEY: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.AnalyticsConfig,
    description: 'Enable or disable analytics for telemetry',
    type: ConfigVariableType.BOOLEAN,
  })
  @IsOptional()
  ANALYTICS_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.AnalyticsConfig,
    description: 'Clickhouse host for analytics',
    type: ConfigVariableType.STRING,
    isSensitive: true,
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
    type: ConfigVariableType.BOOLEAN,
  })
  @IsOptional()
  TELEMETRY_ENABLED = true;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.BillingConfig,
    description: 'Enable or disable billing features',
    type: ConfigVariableType.BOOLEAN,
  })
  @IsOptional()
  IS_BILLING_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.BillingConfig,
    description: 'Link required for billing plan',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_PLAN_REQUIRED_LINK: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.BillingConfig,
    description: 'Duration of free trial with credit card in days',
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  @IsOptional()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS = 30;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.BillingConfig,
    description: 'Duration of free trial without credit card in days',
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  @IsOptional()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_FREE_TRIAL_WITHOUT_CREDIT_CARD_DURATION_IN_DAYS = 7;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.BillingConfig,
    description: 'Amount of money in cents to trigger a billing threshold',
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_SUBSCRIPTION_THRESHOLD_AMOUNT = 10000;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.BillingConfig,
    description: 'Amount of credits for the free trial without credit card',
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_FREE_WORKFLOW_CREDITS_FOR_TRIAL_PERIOD_WITHOUT_CREDIT_CARD = 5000;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.BillingConfig,
    description: 'Amount of credits for the free trial with credit card',
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_FREE_WORKFLOW_CREDITS_FOR_TRIAL_PERIOD_WITH_CREDIT_CARD = 10000;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.BillingConfig,
    isSensitive: true,
    description: 'Stripe API key for billing',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_STRIPE_API_KEY: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.BillingConfig,
    isSensitive: true,
    description: 'Stripe webhook secret for billing',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_STRIPE_WEBHOOK_SECRET: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description: 'Url for the frontend application',
    type: ConfigVariableType.STRING,
    isEnvOnly: true,
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @IsOptional()
  FRONTEND_URL: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description:
      'Default subdomain for the frontend when multi-workspace is enabled',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.IS_MULTIWORKSPACE_ENABLED)
  DEFAULT_SUBDOMAIN = 'app';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description: 'ID for the Chrome extension',
    type: ConfigVariableType.STRING,
  })
  @IsOptional()
  CHROME_EXTENSION_ID: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description: 'Page ID for Cal.com booking integration',
    type: ConfigVariableType.STRING,
  })
  @IsOptional()
  CALENDAR_BOOKING_PAGE_ID?: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Logging,
    description: 'Enable or disable buffering for logs before sending',
    type: ConfigVariableType.BOOLEAN,
  })
  @IsOptional()
  LOGGER_IS_BUFFER_ENABLED = true;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Logging,
    description: 'Driver used for handling exceptions (Console or Sentry)',
    type: ConfigVariableType.ENUM,
    options: Object.values(ExceptionHandlerDriver),
    isEnvOnly: true,
  })
  @IsOptional()
  @CastToUpperSnakeCase()
  EXCEPTION_HANDLER_DRIVER: ExceptionHandlerDriver =
    ExceptionHandlerDriver.CONSOLE;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Logging,
    description: 'Levels of logging to be captured',
    type: ConfigVariableType.ARRAY,
    options: ['log', 'error', 'warn', 'debug'],
    isEnvOnly: true,
  })
  @CastToLogLevelArray()
  @IsOptional()
  LOG_LEVELS: LogLevel[] = ['log', 'error', 'warn'];

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Metering,
    description: 'Driver used for collect metrics (OpenTelemetry or Console)',
    type: ConfigVariableType.ARRAY,
    options: ['OpenTelemetry', 'Console'],
    isEnvOnly: true,
  })
  @CastToMeterDriverArray()
  @IsOptional()
  METER_DRIVER: MeterDriver[] = [];

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Metering,
    description: 'Endpoint URL for the OpenTelemetry collector',
    type: ConfigVariableType.STRING,
    isEnvOnly: true,
  })
  @IsOptional()
  OTLP_COLLECTOR_ENDPOINT_URL: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ExceptionHandler,
    description: 'Driver used for logging (only console for now)',
    type: ConfigVariableType.ENUM,
    options: Object.values(LoggerDriverType),
    isEnvOnly: true,
  })
  @IsOptional()
  @CastToUpperSnakeCase()
  LOGGER_DRIVER: LoggerDriverType = LoggerDriverType.CONSOLE;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ExceptionHandler,
    description: 'Data Source Name (DSN) for Sentry logging',
    type: ConfigVariableType.STRING,
    isSensitive: true,
  })
  @ValidateIf(
    (env) => env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.SENTRY,
  )
  SENTRY_DSN: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ExceptionHandler,
    description: 'Front-end DSN for Sentry logging',
    type: ConfigVariableType.STRING,
    isSensitive: true,
  })
  @ValidateIf(
    (env) => env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.SENTRY,
  )
  SENTRY_FRONT_DSN: string;
  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ExceptionHandler,
    description: 'Environment name for Sentry logging',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf(
    (env) => env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.SENTRY,
  )
  @IsOptional()
  SENTRY_ENVIRONMENT: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.SupportChatConfig,
    description: 'Driver used for support chat integration',
    type: ConfigVariableType.ENUM,
    options: Object.values(SupportDriver),
  })
  @IsOptional()
  @CastToUpperSnakeCase()
  SUPPORT_DRIVER: SupportDriver = SupportDriver.NONE;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.SupportChatConfig,
    isSensitive: true,
    description: 'Chat ID for the support front integration',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.SUPPORT_DRIVER === SupportDriver.FRONT)
  SUPPORT_FRONT_CHAT_ID: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.SupportChatConfig,
    isSensitive: true,
    description: 'HMAC key for the support front integration',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.SUPPORT_DRIVER === SupportDriver.FRONT)
  SUPPORT_FRONT_HMAC_KEY: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    isSensitive: true,
    description: 'Database connection URL',
    type: ConfigVariableType.STRING,
    isEnvOnly: true,
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
    isEnvOnly: true,
    type: ConfigVariableType.BOOLEAN,
  })
  @IsOptional()
  PG_SSL_ALLOW_SELF_SIGNED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description: 'Enable pg connection pool sharing across tenants',
    isEnvOnly: true,
    type: ConfigVariableType.BOOLEAN,
  })
  @IsOptional()
  PG_ENABLE_POOL_SHARING = true;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description: 'Maximum number of clients in pg connection pool',
    isEnvOnly: true,
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  @IsOptional()
  PG_POOL_MAX_CONNECTIONS = 10;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description: 'Idle timeout in milliseconds for pg connection pool clients',
    isEnvOnly: true,
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  @IsOptional()
  PG_POOL_IDLE_TIMEOUT_MS = 600000;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description: 'Allow idle pg connection pool clients to exit',
    isEnvOnly: true,
    type: ConfigVariableType.BOOLEAN,
  })
  @IsOptional()
  PG_POOL_ALLOW_EXIT_ON_IDLE = true;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description: 'Enable configuration variables to be stored in the database',
    isEnvOnly: true,
    type: ConfigVariableType.BOOLEAN,
  })
  @IsOptional()
  IS_CONFIG_VARIABLES_IN_DB_ENABLED = true;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.TokensDuration,
    description: 'Time-to-live for cache storage in seconds',
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  CACHE_STORAGE_TTL: number = 3600 * 24 * 7;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    isSensitive: true,
    description: 'URL for cache storage (e.g., Redis connection URL)',
    isEnvOnly: true,
    type: ConfigVariableType.STRING,
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
    type: ConfigVariableType.ENUM,
    options: Object.values(NodeEnvironment),
    isEnvOnly: true,
  })
  // @CastToUpperSnakeCase()
  NODE_ENV: NodeEnvironment = NodeEnvironment.PRODUCTION;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description: 'Port for the node server',
    type: ConfigVariableType.NUMBER,
    isEnvOnly: true,
  })
  @CastToPositiveNumber()
  @IsOptional()
  NODE_PORT = 3000;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description: 'Base URL for the server',
    type: ConfigVariableType.STRING,
    isEnvOnly: true,
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @IsOptional()
  SERVER_URL = 'http://localhost:3000';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    isSensitive: true,
    description: 'Secret key for the application',
    isEnvOnly: true,
    type: ConfigVariableType.STRING,
  })
  APP_SECRET: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.RateLimiting,
    description: 'Maximum number of records affected by mutations',
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  @IsOptional()
  MUTATION_MAXIMUM_AFFECTED_RECORDS = 100;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.RateLimiting,
    description: 'Time-to-live for API rate limiting in milliseconds',
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  API_RATE_LIMITING_TTL = 100;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.RateLimiting,
    description:
      'Maximum number of requests allowed in the rate limiting window',
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  API_RATE_LIMITING_LIMIT = 500;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.SSL,
    description: 'Path to the SSL key for enabling HTTPS in local development',
    type: ConfigVariableType.STRING,
    isEnvOnly: true,
  })
  @IsOptional()
  SSL_KEY_PATH: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.SSL,
    description:
      'Path to the SSL certificate for enabling HTTPS in local development',
    type: ConfigVariableType.STRING,
    isEnvOnly: true,
  })
  @IsOptional()
  SSL_CERT_PATH: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.CloudflareConfig,
    isSensitive: true,
    description: 'API key for Cloudflare integration',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.CLOUDFLARE_ZONE_ID)
  CLOUDFLARE_API_KEY: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.CloudflareConfig,
    description: 'Zone ID for Cloudflare integration',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.CLOUDFLARE_API_KEY)
  CLOUDFLARE_ZONE_ID: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description: 'Random string to validate queries from Cloudflare',
    type: ConfigVariableType.STRING,
    isSensitive: true,
  })
  @IsOptional()
  CLOUDFLARE_WEBHOOK_SECRET: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description:
      'Id to generate value for CNAME record to validate ownership and manage ssl for custom hostname with Cloudflare',
    type: ConfigVariableType.STRING,
  })
  @IsOptional()
  CLOUDFLARE_DCV_DELEGATION_ID: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.LLM,
    description:
      'Default model ID for AI operations (can be any available model)',
    type: ConfigVariableType.STRING,
  })
  @IsOptional()
  DEFAULT_MODEL_ID = 'gpt-4o';

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.LLM,
    isSensitive: true,
    description: 'API key for OpenAI integration',
    type: ConfigVariableType.STRING,
  })
  @IsOptional()
  OPENAI_API_KEY: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.LLM,
    isSensitive: true,
    description: 'API key for Anthropic integration',
    type: ConfigVariableType.STRING,
  })
  @IsOptional()
  ANTHROPIC_API_KEY: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.LLM,
    description: 'Base URL for OpenAI-compatible LLM provider (e.g., Ollama)',
    type: ConfigVariableType.STRING,
  })
  @IsOptional()
  @IsUrl({ require_tld: false, require_protocol: true })
  OPENAI_COMPATIBLE_BASE_URL: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.LLM,
    description:
      'Model names for OpenAI-compatible LLM provider (comma-separated, e.g., "llama3.1, mistral, codellama")',
    type: ConfigVariableType.STRING,
  })
  @IsOptional()
  OPENAI_COMPATIBLE_MODEL_NAMES: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.LLM,
    isSensitive: true,
    description:
      'API key for OpenAI-compatible LLM provider (optional for providers like Ollama)',
    type: ConfigVariableType.STRING,
  })
  @IsOptional()
  OPENAI_COMPATIBLE_API_KEY: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description: 'Enable or disable multi-workspace support',
    type: ConfigVariableType.BOOLEAN,
    isEnvOnly: true,
  })
  @IsOptional()
  IS_MULTIWORKSPACE_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description: 'Enable or disable workspace creation by users',
    type: ConfigVariableType.BOOLEAN,
    isEnvOnly: true,
  })
  @IsOptional()
  IS_WORKSPACE_CREATION_LIMITED_TO_ADMINS = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description:
      'Number of inactive days before sending a deletion warning for workspaces. Used in the workspace deletion cron job to determine when to send warning emails.',
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  @IsStrictlyLowerThan('WORKSPACE_INACTIVE_DAYS_BEFORE_SOFT_DELETION', {
    message:
      '"WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION" should be strictly lower than "WORKSPACE_INACTIVE_DAYS_BEFORE_SOFT_DELETION"',
  })
  WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION = 7;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description: 'Number of inactive days before soft deleting workspaces',
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  @IsStrictlyLowerThan('WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION', {
    message:
      '"WORKSPACE_INACTIVE_DAYS_BEFORE_SOFT_DELETION" should be strictly lower than "WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION"',
  })
  WORKSPACE_INACTIVE_DAYS_BEFORE_SOFT_DELETION = 14;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description: 'Number of inactive days before deleting workspaces',
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION = 21;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description:
      'Maximum number of workspaces that can be deleted in a single execution',
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  @ValidateIf((env) => env.MAX_NUMBER_OF_WORKSPACES_DELETED_PER_EXECUTION > 0)
  MAX_NUMBER_OF_WORKSPACES_DELETED_PER_EXECUTION = 5;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.RateLimiting,
    description: 'Throttle limit for workflow execution',
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  WORKFLOW_EXEC_THROTTLE_LIMIT = 10;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.RateLimiting,
    description: 'Time-to-live for workflow execution throttle in milliseconds',
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  WORKFLOW_EXEC_THROTTLE_TTL = 1000;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.CaptchaConfig,
    description: 'Driver for captcha integration',
    type: ConfigVariableType.ENUM,
    options: Object.values(CaptchaDriverType),
    isEnvOnly: true,
  })
  @IsOptional()
  @CastToUpperSnakeCase()
  CAPTCHA_DRIVER?: CaptchaDriverType;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.CaptchaConfig,
    isSensitive: true,
    description: 'Site key for captcha integration',
    type: ConfigVariableType.STRING,
  })
  @IsOptional()
  CAPTCHA_SITE_KEY?: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.CaptchaConfig,
    isSensitive: true,
    description: 'Secret key for captcha integration',
    type: ConfigVariableType.STRING,
  })
  @IsOptional()
  CAPTCHA_SECRET_KEY?: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    isSensitive: true,
    description: 'License key for the Enterprise version',
    type: ConfigVariableType.STRING,
  })
  @IsOptional()
  ENTERPRISE_KEY: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description: 'Health monitoring time window in minutes',
    type: ConfigVariableType.NUMBER,
  })
  @CastToPositiveNumber()
  @IsOptional()
  HEALTH_METRICS_TIME_WINDOW_IN_MINUTES = 5;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description: 'Enable or disable the attachment preview feature',
    type: ConfigVariableType.BOOLEAN,
  })
  @IsOptional()
  IS_ATTACHMENT_PREVIEW_ENABLED = true;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.ServerConfig,
    description: 'Twenty server version',
    type: ConfigVariableType.STRING,
    isEnvOnly: true,
  })
  @IsOptionalOrEmptyString()
  @IsTwentySemVer()
  APP_VERSION?: string;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    description: 'Enable or disable google map api usage',
    type: ConfigVariableType.BOOLEAN,
  })
  @IsOptional()
  IS_MAPS_AND_ADDRESS_AUTOCOMPLETE_ENABLED = false;

  @ConfigVariablesMetadata({
    group: ConfigVariablesGroup.Other,
    isSensitive: true,
    description: 'Google map api key for places and map',
    type: ConfigVariableType.STRING,
  })
  @ValidateIf((env) => env.IS_MAPS_AND_ADDRESS_AUTOCOMPLETE_ENABLED)
  GOOGLE_MAP_API_KEY: string;
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
    throw new ConfigVariableException(
      'Config variables validation failed',
      ConfigVariableExceptionCode.VALIDATION_FAILED,
    );
  }

  return validatedConfig;
};
