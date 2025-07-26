import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';

type GroupMetadata = {
  position: number;
  description: string;
  isHiddenOnLoad: boolean;
};

export const CONFIG_VARIABLES_GROUP_METADATA: Record<
  ConfigVariablesGroup,
  GroupMetadata
> = {
  [ConfigVariablesGroup.ServerConfig]: {
    position: 100,
    description: '',
    isHiddenOnLoad: false,
  },
  [ConfigVariablesGroup.RateLimiting]: {
    position: 200,
    description:
      'We use this to limit the number of requests to the server. This is useful to prevent abuse.',
    isHiddenOnLoad: true,
  },
  [ConfigVariablesGroup.StorageConfig]: {
    position: 300,
    description:
      'By default, file uploads are stored on the local filesystem, which is suitable for traditional servers. However, for ephemeral deployment servers, it is essential to configure the variables here to set up an S3-compatible file system. This ensures that files remain unaffected by server redeploys.',
    isHiddenOnLoad: false,
  },
  [ConfigVariablesGroup.GoogleAuth]: {
    position: 400,
    description: 'Configure Google integration (login, calendar, email)',
    isHiddenOnLoad: false,
  },
  [ConfigVariablesGroup.MicrosoftAuth]: {
    position: 500,
    description: 'Configure Microsoft integration (login, calendar, email)',
    isHiddenOnLoad: false,
  },
  [ConfigVariablesGroup.EmailSettings]: {
    position: 600,
    description:
      'This is used for emails that are sent by the app such as invitations to join a workspace. This is not used to email CRM contacts.',
    isHiddenOnLoad: false,
  },
  [ConfigVariablesGroup.Logging]: {
    position: 700,
    description: '',
    isHiddenOnLoad: true,
  },
  [ConfigVariablesGroup.ExceptionHandler]: {
    position: 800,
    description:
      'By default, exceptions are sent to the logs. This should be enough for most self-hosting use-cases. For our cloud app we use Sentry.',
    isHiddenOnLoad: true,
  },
  [ConfigVariablesGroup.Metering]: {
    position: 900,
    description:
      'By default, metrics are sent to the console. OpenTelemetry collector can be set up for self-hosting use-cases.',
    isHiddenOnLoad: true,
  },
  [ConfigVariablesGroup.Other]: {
    position: 1000,
    description:
      "The variables in this section are mostly used for internal purposes (running our Cloud offering), but shouldn't usually be required for a simple self-hosted instance",
    isHiddenOnLoad: true,
  },
  [ConfigVariablesGroup.BillingConfig]: {
    position: 1100,
    description:
      'We use Stripe in our Cloud app to charge customers. Not relevant to Self-hosters.',
    isHiddenOnLoad: true,
  },
  [ConfigVariablesGroup.CaptchaConfig]: {
    position: 1200,
    description:
      'This protects critical endpoints like login and signup with a captcha to prevent bot attacks. Likely unnecessary for self-hosting scenarios.',
    isHiddenOnLoad: true,
  },
  [ConfigVariablesGroup.CloudflareConfig]: {
    position: 1300,
    description: '',
    isHiddenOnLoad: true,
  },
  [ConfigVariablesGroup.LLM]: {
    position: 1400,
    description:
      'Configure the LLM provider and model to use for the app. This is experimental and not linked to any public feature.',
    isHiddenOnLoad: true,
  },
  [ConfigVariablesGroup.ServerlessConfig]: {
    position: 1500,
    description:
      'In our multi-tenant cloud app, we offload untrusted custom code from workflows to a serverless system (Lambda) for enhanced security and scalability. Self-hosters with a single tenant can typically ignore this configuration.',
    isHiddenOnLoad: true,
  },
  [ConfigVariablesGroup.SSL]: {
    position: 1600,
    description:
      'Configure this if you want to setup SSL on your server or full end-to-end encryption. If you just want basic HTTPS, a simple setup like Cloudflare in flexible mode might be easier.',
    isHiddenOnLoad: true,
  },
  [ConfigVariablesGroup.SupportChatConfig]: {
    position: 1700,
    description:
      'We use this to setup a small support chat on the bottom left. Currently powered by Front.',
    isHiddenOnLoad: true,
  },
  [ConfigVariablesGroup.AnalyticsConfig]: {
    position: 1800,
    description:
      'We’re running a test to perform analytics within the app. This will evolve.',
    isHiddenOnLoad: true,
  },
  [ConfigVariablesGroup.TokensDuration]: {
    position: 1900,
    description:
      'These have been set to sensible default so you probably don’t need to change them unless you have a specific use-case.',
    isHiddenOnLoad: true,
  },
  [ConfigVariablesGroup.TwoFactorAuthentication]: {
    position: 2000,
    description:
      'These have been set to sensible default so you probably don’t need to change them unless you have a specific use-case.',
    isHiddenOnLoad: true,
  },
};
