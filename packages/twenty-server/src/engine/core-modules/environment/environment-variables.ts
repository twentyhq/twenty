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
import { IsAWSRegion } from 'src/engine/core-modules/environment/decorators/is-aws-region.decorator';
import { IsDuration } from 'src/engine/core-modules/environment/decorators/is-duration.decorator';
import { IsStrictlyLowerThan } from 'src/engine/core-modules/environment/decorators/is-strictly-lower-than.decorator';
import { ExceptionHandlerDriver } from 'src/engine/core-modules/exception-handler/interfaces';
import { StorageDriverType } from 'src/engine/core-modules/file-storage/interfaces';
import { LoggerDriverType } from 'src/engine/core-modules/logger/interfaces';
import { MessageQueueDriverType } from 'src/engine/core-modules/message-queue/interfaces';
import { ServerlessDriverType } from 'src/engine/core-modules/serverless/serverless.interface';
import { assert } from 'src/utils/assert';

export class EnvironmentVariables {
  // Misc
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  DEBUG_MODE = false;

  @IsEnum(NodeEnvironment)
  @IsString()
  NODE_ENV: NodeEnvironment = NodeEnvironment.development;

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
  BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS = 30;

  @IsNumber()
  @CastToPositiveNumber()
  @IsOptional()
  @ValidateIf((env) => env.IS_BILLING_ENABLED === true)
  BILLING_FREE_TRIAL_WITHOUT_CREDIT_CARD_DURATION_IN_DAYS = 7;

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
  ANALYTICS_ENABLED = false;

  @IsString()
  @ValidateIf((env) => env.ANALYTICS_ENABLED)
  TINYBIRD_INGEST_TOKEN: string;

  @IsString()
  @ValidateIf((env) => env.ANALYTICS_ENABLED)
  TINYBIRD_WORKSPACE_UUID: string;

  @IsString()
  @ValidateIf((env) => env.ANALYTICS_ENABLED)
  TINYBIRD_GENERATE_JWT_TOKEN: string;

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
    require_host: false,
  })
  PG_DATABASE_URL: string;

  @CastToBoolean()
  @IsBoolean()
  @IsOptional()
  PG_SSL_ALLOW_SELF_SIGNED = false;

  // Frontend URL
  @IsString()
  @IsOptional()
  FRONT_DOMAIN?: string;

  @IsString()
  @ValidateIf((env) => env.IS_MULTIWORKSPACE_ENABLED)
  DEFAULT_SUBDOMAIN = 'app';

  @IsString()
  @IsOptional()
  FRONT_PROTOCOL?: 'http' | 'https' = 'http';

  @CastToPositiveNumber()
  @IsNumber()
  @IsOptional()
  FRONT_PORT?: number;

  @IsUrl({ require_tld: false, require_protocol: true })
  @IsOptional()
  SERVER_URL = 'http://localhost:3000';

  @IsString()
  APP_SECRET: string;

  @IsOptional()
  @IsString()
  ACCESS_TOKEN_SECRET: string;

  @IsDuration()
  @IsOptional()
  ACCESS_TOKEN_EXPIRES_IN = '30m';

  @IsOptional()
  REFRESH_TOKEN_EXPIRES_IN = '60d';

  @IsDuration()
  @IsOptional()
  REFRESH_TOKEN_COOL_DOWN = '1m';

  @IsDuration()
  @IsOptional()
  LOGIN_TOKEN_EXPIRES_IN = '15m';

  @IsDuration()
  @IsOptional()
  FILE_TOKEN_EXPIRES_IN = '1d';

  @IsDuration()
  @IsOptional()
  INVITATION_TOKEN_EXPIRES_IN = '30d';

  // Auth
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

  @IsUrl({ require_tld: false, require_protocol: true })
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_CALLBACK_URL: string;

  @IsUrl({ require_tld: false, require_protocol: true })
  @ValidateIf((env) => env.AUTH_MICROSOFT_ENABLED)
  AUTH_MICROSOFT_APIS_CALLBACK_URL: string;

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

  @IsUrl({ require_tld: false, require_protocol: true })
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED)
  AUTH_GOOGLE_CALLBACK_URL: string;

  @IsString()
  @IsOptional()
  ENTERPRISE_KEY: string;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  IS_MULTIWORKSPACE_ENABLED = false;

  // Custom Code Engine
  @IsEnum(ServerlessDriverType)
  @IsOptional()
  SERVERLESS_TYPE: ServerlessDriverType = ServerlessDriverType.Local;

  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.Lambda)
  @IsAWSRegion()
  SERVERLESS_LAMBDA_REGION: AwsRegion;

  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.Lambda)
  @IsString()
  @IsOptional()
  SERVERLESS_LAMBDA_ROLE: string;

  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.Lambda)
  @IsString()
  @IsOptional()
  SERVERLESS_LAMBDA_ACCESS_KEY_ID: string;

  @ValidateIf((env) => env.SERVERLESS_TYPE === ServerlessDriverType.Lambda)
  @IsString()
  @IsOptional()
  SERVERLESS_LAMBDA_SECRET_ACCESS_KEY: string;

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

  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsString()
  @IsOptional()
  STORAGE_S3_ACCESS_KEY_ID: string;

  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsString()
  @IsOptional()
  STORAGE_S3_SECRET_ACCESS_KEY: string;

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

  @IsEnum(CaptchaDriverType)
  @IsOptional()
  CAPTCHA_DRIVER?: CaptchaDriverType;

  @IsString()
  @IsOptional()
  CAPTCHA_SITE_KEY?: string;

  @IsString()
  @IsOptional()
  CAPTCHA_SECRET_KEY?: string;

  @CastToPositiveNumber()
  @IsOptional()
  @IsNumber()
  MUTATION_MAXIMUM_AFFECTED_RECORDS = 100;

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

  SHORT_TERM_TOKEN_EXPIRES_IN = '5m';

  @CastToBoolean()
  MESSAGING_PROVIDER_GMAIL_ENABLED = false;

  MESSAGE_QUEUE_TYPE: string = MessageQueueDriverType.BullMQ;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  IS_EMAIL_VERIFICATION_REQUIRED = false;

  @IsDuration()
  @IsOptional()
  EMAIL_VERIFICATION_TOKEN_EXPIRES_IN = '1h';

  EMAIL_FROM_ADDRESS = 'noreply@yourdomain.com';

  EMAIL_SYSTEM_ADDRESS = 'system@yourdomain.com';

  EMAIL_FROM_NAME = 'Felix from Twenty';

  EMAIL_DRIVER: EmailDriver = EmailDriver.Logger;

  EMAIL_SMTP_HOST: string;

  @CastToPositiveNumber()
  EMAIL_SMTP_PORT = 587;

  EMAIL_SMTP_USER: string;

  EMAIL_SMTP_PASSWORD: string;

  LLM_CHAT_MODEL_DRIVER: LLMChatModelDriver;

  OPENAI_API_KEY: string;

  LANGFUSE_SECRET_KEY: string;

  LANGFUSE_PUBLIC_KEY: string;

  LLM_TRACING_DRIVER: LLMTracingDriver = LLMTracingDriver.Console;

  @CastToPositiveNumber()
  API_RATE_LIMITING_TTL = 100;

  @CastToPositiveNumber()
  API_RATE_LIMITING_LIMIT = 500;

  CACHE_STORAGE_TYPE: CacheStorageType = CacheStorageType.Redis;

  @CastToPositiveNumber()
  CACHE_STORAGE_TTL: number = 3600 * 24 * 7;

  @IsString()
  @IsOptional()
  SESSION_STORE_SECRET = 'replace_me_with_a_random_string_session';

  @CastToBoolean()
  CALENDAR_PROVIDER_GOOGLE_ENABLED = false;

  AUTH_GOOGLE_APIS_CALLBACK_URL: string;

  CHROME_EXTENSION_ID: string;

  @CastToPositiveNumber()
  SERVERLESS_FUNCTION_EXEC_THROTTLE_LIMIT = 10;

  // milliseconds
  @CastToPositiveNumber()
  SERVERLESS_FUNCTION_EXEC_THROTTLE_TTL = 1000;

  @CastToPositiveNumber()
  WORKFLOW_EXEC_THROTTLE_LIMIT = 10;

  // milliseconds
  @CastToPositiveNumber()
  WORKFLOW_EXEC_THROTTLE_TTL = 1000;

  // SSL
  @IsString()
  @IsOptional()
  SSL_KEY_PATH: string;

  @IsString()
  @IsOptional()
  SSL_CERT_PATH: string;
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
