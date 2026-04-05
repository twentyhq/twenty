import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';

type GroupMetadata = {
  position: number;
  description: string;
  isHiddenOnLoad: boolean;
  isHiddenInAdminPanel: boolean;
};

export const CONFIG_VARIABLES_GROUP_METADATA: Record<
  ConfigVariablesGroup,
  GroupMetadata
> = {
  [ConfigVariablesGroup.SERVER_CONFIG]: {
    position: 100,
    description: '',
    isHiddenOnLoad: false,
    isHiddenInAdminPanel: false,
  },
  [ConfigVariablesGroup.RATE_LIMITING]: {
    position: 200,
    description:
      'We use this to limit the number of requests to the server. This is useful to prevent abuse.',
    isHiddenOnLoad: true,
    isHiddenInAdminPanel: false,
  },
  [ConfigVariablesGroup.STORAGE_CONFIG]: {
    position: 300,
    description:
      'By default, file uploads are stored on the local filesystem, which is suitable for traditional servers. However, for ephemeral deployment servers, it is essential to configure the variables here to set up an S3-compatible file system. This ensures that files remain unaffected by server redeploys.',
    isHiddenOnLoad: false,
    isHiddenInAdminPanel: false,
  },
  [ConfigVariablesGroup.GOOGLE_AUTH]: {
    position: 400,
    description: 'Configure Google integration (login, calendar, email)',
    isHiddenOnLoad: false,
    isHiddenInAdminPanel: false,
  },
  [ConfigVariablesGroup.MICROSOFT_AUTH]: {
    position: 500,
    description: 'Configure Microsoft integration (login, calendar, email)',
    isHiddenOnLoad: false,
    isHiddenInAdminPanel: false,
  },
  [ConfigVariablesGroup.EMAIL_SETTINGS]: {
    position: 600,
    description:
      'This is used for emails that are sent by the app such as invitations to join a workspace. This is not used to email CRM contacts.',
    isHiddenOnLoad: false,
    isHiddenInAdminPanel: false,
  },
  [ConfigVariablesGroup.LOGGING]: {
    position: 700,
    description:
      'Configure logging, exception handling, and metrics collection. By default, exceptions go to console and metrics are disabled.',
    isHiddenOnLoad: true,
    isHiddenInAdminPanel: false,
  },
  [ConfigVariablesGroup.ADVANCED_SETTINGS]: {
    position: 1000,
    description:
      'Variables that are rarely changed. Most self-hosted instances will not need to modify these.',
    isHiddenOnLoad: true,
    isHiddenInAdminPanel: false,
  },
  [ConfigVariablesGroup.BILLING_CONFIG]: {
    position: 1100,
    description:
      'We use Stripe in our Cloud app to charge customers. Not relevant to Self-hosters.',
    isHiddenOnLoad: true,
    isHiddenInAdminPanel: true,
  },
  [ConfigVariablesGroup.CAPTCHA_CONFIG]: {
    position: 1200,
    description:
      'This protects critical endpoints like login and signup with a captcha to prevent bot attacks. Likely unnecessary for self-hosting scenarios.',
    isHiddenOnLoad: true,
    isHiddenInAdminPanel: false,
  },
  [ConfigVariablesGroup.CLOUDFLARE_CONFIG]: {
    position: 1300,
    description: '',
    isHiddenOnLoad: true,
    isHiddenInAdminPanel: true,
  },
  [ConfigVariablesGroup.LLM]: {
    position: 1400,
    description:
      'Configure the LLM provider and model to use for the app. We recommend editing these settings through the AI tab in the admin panel instead.',
    isHiddenOnLoad: true,
    isHiddenInAdminPanel: false,
  },
  [ConfigVariablesGroup.LOGIC_FUNCTION_CONFIG]: {
    position: 1500,
    description:
      'In our multi-tenant cloud app, we offload untrusted custom code from workflows to a function execution system (Lambda) for enhanced security and scalability. Self-hosters with a single tenant can typically ignore this configuration.',
    isHiddenOnLoad: true,
    isHiddenInAdminPanel: false,
  },
  [ConfigVariablesGroup.CODE_INTERPRETER_CONFIG]: {
    position: 1550,
    description:
      'Configure the code interpreter for AI data analysis. Use LOCAL for development (unsafe) or E2B for sandboxed execution.',
    isHiddenOnLoad: true,
    isHiddenInAdminPanel: false,
  },
  [ConfigVariablesGroup.SSL]: {
    position: 1600,
    description:
      'Configure this if you want to setup SSL on your server or full end-to-end encryption. If you just want basic HTTPS, a simple setup like Cloudflare in flexible mode might be easier.',
    isHiddenOnLoad: true,
    isHiddenInAdminPanel: false,
  },
  [ConfigVariablesGroup.SUPPORT_CHAT_CONFIG]: {
    position: 1700,
    description:
      'We use this to setup a small support chat on the bottom left. Currently powered by Front.',
    isHiddenOnLoad: true,
    isHiddenInAdminPanel: true,
  },
  [ConfigVariablesGroup.ANALYTICS_CONFIG]: {
    position: 1800,
    description:
      "We're running a test to perform analytics within the app. This will evolve.",
    isHiddenOnLoad: true,
    isHiddenInAdminPanel: true,
  },
  [ConfigVariablesGroup.TOKENS_DURATION]: {
    position: 1900,
    description:
      "These have been set to sensible default so you probably don't need to change them unless you have a specific use-case.",
    isHiddenOnLoad: true,
    isHiddenInAdminPanel: false,
  },
  [ConfigVariablesGroup.AWS_SES_SETTINGS]: {
    position: 2100,
    description:
      'Configure AWS SES settings for emailing domains (mass outbound / feature not released yet)',
    isHiddenOnLoad: true,
    isHiddenInAdminPanel: true,
  },
};
