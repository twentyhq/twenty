import { HttpResponse, graphql } from 'msw';

import {
  CHATGPT_CONNECTABLE_APP,
  CLAUDE_CONNECTABLE_APP,
} from '@/settings/app-preferences/testing/connectableAppFixtures';

export const CONNECTABLE_APPS_GRAPHQL_HANDLER = graphql.query(
  'FindManyMarketplaceApps',
  () =>
    HttpResponse.json({
      data: {
        findManyMarketplaceApps: [
          CHATGPT_CONNECTABLE_APP,
          CLAUDE_CONNECTABLE_APP,
        ].map((connectableApp) => ({
          __typename: 'MarketplaceApp',
          author: '',
          category: 'Productivity',
          sourcePackage: null,
          isListed: true,
          ...connectableApp,
        })),
      },
    }),
);
