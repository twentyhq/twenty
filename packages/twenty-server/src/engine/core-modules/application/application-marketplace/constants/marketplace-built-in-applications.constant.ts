import { MARKETPLACE_BUILT_IN_APPLICATION_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-built-in-application-universal-identifiers.constant';
import { type MarketplaceBuiltInApplication } from 'src/engine/core-modules/application/application-marketplace/types/marketplace-built-in-application.type';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

export const MARKETPLACE_BUILT_IN_APPLICATIONS: MarketplaceBuiltInApplication[] =
  [
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
