import { MARKETPLACE_APP_MCP_SERVER_URL_PLACEHOLDER } from 'twenty-shared/application';

import { MARKETPLACE_BUILT_IN_APPLICATION_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-built-in-application-universal-identifiers.constant';
import { type MarketplaceBuiltInApplication } from 'src/engine/core-modules/application/application-marketplace/types/marketplace-built-in-application.type';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

export const MARKETPLACE_BUILT_IN_APPLICATIONS: MarketplaceBuiltInApplication[] =
  [
    {
      universalIdentifier:
        MARKETPLACE_BUILT_IN_APPLICATION_UNIVERSAL_IDENTIFIERS.CLAUDE,
      name: 'Claude',
      description:
        'Search, create and update your Twenty records from a Claude conversation.',
      aboutDescription:
        'Connect Claude to Twenty to work with your records from a conversation. Each member connects their own Claude account, and Claude acts with that member’s permissions.',
      author: 'Anthropic',
      category: 'Productivity',
      logoPath: '/images/oauth-clients/claude.webp',
      coverImagePath: '/images/oauth-clients/covers/claude.webp',
      websiteUrl: 'https://claude.ai',
      connectUrl: `https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Twenty&connectorUrl=${MARKETPLACE_APP_MCP_SERVER_URL_PLACEHOLDER}`,
    },
    {
      universalIdentifier:
        MARKETPLACE_BUILT_IN_APPLICATION_UNIVERSAL_IDENTIFIERS.CHATGPT,
      name: 'ChatGPT',
      description:
        'Search, create and update your Twenty records from a ChatGPT conversation.',
      aboutDescription:
        'Connect ChatGPT to Twenty to work with your records from a conversation. Each member connects their own ChatGPT account, and ChatGPT acts with that member’s permissions.',
      author: 'OpenAI',
      category: 'Productivity',
      logoPath: '/images/oauth-clients/chatgpt.webp',
      coverImagePath: '/images/oauth-clients/covers/chatgpt.webp',
      websiteUrl: 'https://chatgpt.com',
      connectUrl:
        'https://chatgpt.com/apps/twenty/asdk_app_6a0ac8d7e28c8191a58ea65bb0ca3d5c',
    },
    {
      universalIdentifier:
        MARKETPLACE_BUILT_IN_APPLICATION_UNIVERSAL_IDENTIFIERS.TWENTY_CLI,
      name: TWENTY_CLI_APPLICATION_REGISTRATION.name,
      description: 'Build, run and deploy Twenty apps from your terminal.',
      aboutDescription:
        'The Twenty CLI scaffolds an app, runs it against your workspace while you develop, and deploys it. You sign in from the terminal, and the CLI acts with your permissions.',
      author: 'Twenty',
      category: 'Developer tools',
      logoPath: '/images/oauth-clients/twenty-cli.svg',
      coverImagePath: '/images/oauth-clients/covers/twenty-cli.webp',
      websiteUrl:
        'https://docs.twenty.com/developers/extend/apps/getting-started/quick-start',
      connectUrl:
        'https://docs.twenty.com/developers/extend/apps/getting-started/quick-start',
    },
  ];
