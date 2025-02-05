import { EnvironmentVariablesSubGroup } from 'src/engine/core-modules/environment/enums/environment-variables-sub-group.enum';

type SubGroupMetadata = {
  description: string;
};

export const ENVIRONMENT_VARIABLES_SUB_GROUP_METADATA: Record<
  EnvironmentVariablesSubGroup,
  SubGroupMetadata
> = {
  [EnvironmentVariablesSubGroup.PasswordAuth]: {
    description: '',
  },
  [EnvironmentVariablesSubGroup.GoogleAuth]: {
    description: '',
  },
  [EnvironmentVariablesSubGroup.MicrosoftAuth]: {
    description: '',
  },
  [EnvironmentVariablesSubGroup.EmailSettings]: {
    description: '',
  },
  [EnvironmentVariablesSubGroup.StorageConfig]: {
    description:
      "By default, file uploads are stored on the local filesystem, which is suitable for traditional servers. However, for ephemeral deployment servers, it's essential to configure the variables here to set up an S3-compatible file system. This ensures that files remain unaffected by server redeploys.",
  },
  [EnvironmentVariablesSubGroup.TokensDuration]: {
    description: '',
  },
  [EnvironmentVariablesSubGroup.SSL]: {
    description: '',
  },
  [EnvironmentVariablesSubGroup.RateLimiting]: {
    description: '',
  },
  [EnvironmentVariablesSubGroup.TinybirdConfig]: {
    description: '',
  },
  [EnvironmentVariablesSubGroup.BillingConfig]: {
    description: '',
  },
  [EnvironmentVariablesSubGroup.ExceptionHandler]: {
    description: '',
  },
  [EnvironmentVariablesSubGroup.SupportChatConfig]: {
    description: '',
  },
  [EnvironmentVariablesSubGroup.CloudflareConfig]: {
    description: '',
  },
  [EnvironmentVariablesSubGroup.CaptchaConfig]: {
    description: '',
  },
  [EnvironmentVariablesSubGroup.ServerlessConfig]: {
    description: '',
  },
};
