import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';

type GroupMetadata = {
  position: number;
  description: string;
  isHiddenOnLoad: boolean;
};

export const ENVIRONMENT_VARIABLES_GROUP_METADATA: Record<
  EnvironmentVariablesGroup,
  GroupMetadata
> = {
  [EnvironmentVariablesGroup.ServerConfig]: {
    position: 100,
    description: '',
    isHiddenOnLoad: false,
  },
  [EnvironmentVariablesGroup.RateLimiting]: {
    position: 200,
    description:
      'We use this to limit the number of requests to the server. This is useful to prevent abuse.',
    isHiddenOnLoad: false,
  },
  [EnvironmentVariablesGroup.StorageConfig]: {
    position: 300,
    description:
      'By default, file uploads are stored on the local filesystem, which is suitable for traditional servers. However, for ephemeral deployment servers, it is essential to configure the variables here to set up an S3-compatible file system. This ensures that files remain unaffected by server redeploys.',
    isHiddenOnLoad: false,
  },
  [EnvironmentVariablesGroup.GoogleAuth]: {
    position: 400,
    description: 'Configure Google integration (login, calendar, email)',
    isHiddenOnLoad: false,
  },
  [EnvironmentVariablesGroup.MicrosoftAuth]: {
    position: 500,
    description: 'Configure Microsoft integration (login, calendar, email)',
    isHiddenOnLoad: false,
  },
  [EnvironmentVariablesGroup.EmailSettings]: {
    position: 600,
    description:
      'This is used for emails that are sent by the app such as invitations to join a workspace. This is not used to email CRM contacts.',
    isHiddenOnLoad: false,
  },
  [EnvironmentVariablesGroup.Logging]: {
    position: 700,
    description: '',
    isHiddenOnLoad: false,
  },
  [EnvironmentVariablesGroup.ExceptionHandler]: {
    position: 800,
    description:
      'By default, exceptions are sent to the logs. This should be enough for most self-hosting use-cases. For our cloud app we use Sentry.',
    isHiddenOnLoad: false,
  },
  [EnvironmentVariablesGroup.Other]: {
    position: 900,
    description:
      "The variables in this section are mostly used for internal purposes (running our Cloud offering), but shouldn't usually be required for a simple self-hosted instance",
    isHiddenOnLoad: true,
  },
  [EnvironmentVariablesGroup.BillingConfig]: {
    position: 1000,
    description:
      'We use Stripe in our Cloud app to charge customers. Not relevant to Self-hosters.',
    isHiddenOnLoad: true,
  },
  [EnvironmentVariablesGroup.CaptchaConfig]: {
    position: 1100,
    description:
      'This protects critical endpoints like login and signup with a captcha to prevent bot attacks. Likely unnecessary for self-hosting scenarios.',
    isHiddenOnLoad: true,
  },
  [EnvironmentVariablesGroup.CloudflareConfig]: {
    position: 1200,
    description: '',
    isHiddenOnLoad: true,
  },
  [EnvironmentVariablesGroup.LLM]: {
    position: 1300,
    description:
      'Configure the LLM provider and model to use for the app. This is experimental and not linked to any public feature.',
    isHiddenOnLoad: true,
  },
  [EnvironmentVariablesGroup.ServerlessConfig]: {
    position: 1400,
    description:
      'In our multi-tenant cloud app, we offload untrusted custom code from workflows to a serverless system (Lambda) for enhanced security and scalability. Self-hosters with a single tenant can typically ignore this configuration.',
    isHiddenOnLoad: true,
  },
  [EnvironmentVariablesGroup.SSL]: {
    position: 1500,
    description:
      'Configure this if you want to setup SSL on your server or full end-to-end encryption. If you just want basic HTTPS, a simple setup like Cloudflare in flexible mode might be easier.',
    isHiddenOnLoad: true,
  },
  [EnvironmentVariablesGroup.SupportChatConfig]: {
    position: 1600,
    description:
      'We use this to setup a small support chat on the bottom left. Currently powered by Front.',
    isHiddenOnLoad: true,
  },
  [EnvironmentVariablesGroup.TinybirdConfig]: {
    position: 1700,
    description:
      'We’re running a test to perform analytics within the app. This will evolve.',
    isHiddenOnLoad: true,
  },
  [EnvironmentVariablesGroup.TokensDuration]: {
    position: 1800,
    description:
      'These have been set to sensible default so you probably don’t need to change them unless you have a specific use-case.',
    isHiddenOnLoad: true,
  },
};
