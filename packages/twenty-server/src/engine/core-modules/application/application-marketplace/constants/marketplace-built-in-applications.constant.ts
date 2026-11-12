import { type MarketplaceBuiltInApplication } from 'src/engine/core-modules/application/application-marketplace/types/marketplace-built-in-application.type';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

// The front end serves logoPath and fills in {mcpServerUrl}.
export const MARKETPLACE_BUILT_IN_APPLICATIONS: MarketplaceBuiltInApplication[] =
  [
    {
      universalIdentifier: '20202020-b759-4b27-9593-4d075aea79ed',
      name: 'Claude',
      description:
        'Search, create and update your Twenty records from a Claude conversation.',
      aboutDescription:
        'Connect Claude to Twenty to work with your records from a conversation. Each member connects their own Claude account, and Claude acts with that member’s permissions.',
      author: 'Anthropic',
      category: 'Productivity',
      logoPath: '/images/oauth-clients/claude.webp',
      websiteUrl: 'https://claude.ai',
      connectUrl:
        'https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Twenty&connectorUrl={mcpServerUrl}',
    },
    {
      universalIdentifier: '20202020-2cef-4d6c-9c88-05b40177ce9e',
      name: 'ChatGPT',
      description:
        'Search, create and update your Twenty records from a ChatGPT conversation.',
      aboutDescription:
        'Connect ChatGPT to Twenty to work with your records from a conversation. Each member connects their own ChatGPT account, and ChatGPT acts with that member’s permissions.',
      author: 'OpenAI',
      category: 'Productivity',
      logoPath: '/images/oauth-clients/chatgpt.webp',
      websiteUrl: 'https://chatgpt.com',
      connectUrl:
        'https://chatgpt.com/apps/twenty/asdk_app_6a0ac8d7e28c8191a58ea65bb0ca3d5c',
    },
    {
      universalIdentifier:
        TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
      name: TWENTY_CLI_APPLICATION_REGISTRATION.name,
      description: 'Build, run and deploy Twenty apps from your terminal.',
      aboutDescription:
        'The Twenty CLI scaffolds an app, runs it against your workspace while you develop, and deploys it. You sign in from the terminal, and the CLI acts with your permissions.',
      author: 'Twenty',
      category: 'Developer tools',
      logoPath: '/images/oauth-clients/twenty-cli.svg',
      websiteUrl:
        'https://docs.twenty.com/developers/extend/apps/getting-started/quick-start',
      connectUrl:
        'https://docs.twenty.com/developers/extend/apps/getting-started/quick-start',
    },
  ];
