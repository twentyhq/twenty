import { definePostInstallLogicFunction } from 'twenty-sdk/define';

import {
  BACKFILL_COMPANIES_ROUTE_PATH,
  BACKFILL_OPPORTUNITIES_ROUTE_PATH,
  BACKFILL_PEOPLE_ROUTE_PATH,
} from 'src/constants/backfill';
import { BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { postToOwnRoute } from 'src/utils/post-to-own-route';

// Kicks off the three cursor-paginated backfills. Each one walks its own
// records in small batches and re-triggers itself with the next cursor, so
// the update load stays spread out instead of firing every mutation at once.
const handler = async (): Promise<void> => {
  await postToOwnRoute({ path: BACKFILL_PEOPLE_ROUTE_PATH, body: {} });
  await postToOwnRoute({ path: BACKFILL_COMPANIES_ROUTE_PATH, body: {} });
  await postToOwnRoute({ path: BACKFILL_OPPORTUNITIES_ROUTE_PATH, body: {} });
};

export default definePostInstallLogicFunction({
  universalIdentifier: BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-last-contact',
  description:
    'Starts the people, company and opportunity last-contact backfills after installation.',
  timeoutSeconds: 60,
  shouldRunOnVersionUpgrade: true,
  handler,
});
