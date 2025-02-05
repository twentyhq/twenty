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
    description: 'Configure Google integration (login, calendar, email)',
  },
  [EnvironmentVariablesSubGroup.MicrosoftAuth]: {
    description: 'Configure Microsoft integration (login, calendar, email)',
  },
  [EnvironmentVariablesSubGroup.EmailSettings]: {
    description:
      'This is used for emails that are sent by the app such as invitations to join a workspace. This is not used to email CRM contacts.',
  },
  [EnvironmentVariablesSubGroup.StorageConfig]: {
    description:
      "By default, file uploads are stored on the local filesystem, which is suitable for traditional servers. However, for ephemeral deployment servers, it's essential to configure the variables here to set up an S3-compatible file system. This ensures that files remain unaffected by server redeploys.",
  },
  [EnvironmentVariablesSubGroup.TokensDuration]: {
    description:
      "These have been set to sensible default so you probably don't need to change them unless you have a specific use-case.",
  },
  [EnvironmentVariablesSubGroup.SSL]: {
    description:
      'Configure this if you want to setup SSL on your server or full end-to-end encryption. If you just want basic HTTPS, a simple setup like Cloudflare in flexible mode might be easier.',
  },
  [EnvironmentVariablesSubGroup.RateLimiting]: {
    description:
      'We use this to limit the number of requests to the server. This is useful to prevent abuse.',
  },
  [EnvironmentVariablesSubGroup.TinybirdConfig]: {
    description:
      "We're running a test to perform analytics within the app. This will evolve.",
  },
  [EnvironmentVariablesSubGroup.BillingConfig]: {
    description:
      'We use Stripe in our Cloud app to charge customers. Not relevant to Self-hosters.',
  },
  [EnvironmentVariablesSubGroup.ExceptionHandler]: {
    description:
      'By default, exceptions are sent to the logs. This should be enough for most self-hosting use-cases. For our cloud app we use Sentry.',
  },
  [EnvironmentVariablesSubGroup.SupportChatConfig]: {
    description:
      'We use this to setup a small support chat on the bottom left. Currently powered by Front.',
  },
  [EnvironmentVariablesSubGroup.CloudflareConfig]: {
    description: '',
  },
  [EnvironmentVariablesSubGroup.CaptchaConfig]: {
    description:
      'This protects critical endpoints like login and signup with a captcha to prevent bot attacks. Likely unnecessary for self-hosting scenarios.',
  },
  [EnvironmentVariablesSubGroup.ServerlessConfig]: {
    description:
      'In our multi-tenant cloud app, we offload untrusted custom code from workflows to a serverless system (Lambda) for enhanced security and scalability. Self-hosters with a single tenant can typically ignore this configuration.',
  },
  [EnvironmentVariablesSubGroup.LLM]: {
    description:
      'Configure the LLM provider and model to use for the app. This is experimental and not linked to any public feature.',
  },
};
