import { isNonEmptyString } from '@sniptt/guards';

import { type GraphCollectionPage } from 'src/features/transcripts/logic-functions/types/graph-collection-page.type';
import { fetchGraphJson } from 'src/features/transcripts/logic-functions/utils/fetch-graph-json';

export const fetchTeamsTenantId = async (
  accessToken: string,
): Promise<string> => {
  const page = await fetchGraphJson<GraphCollectionPage<{ id?: unknown }>>({
    accessToken,
    url: 'organization?$select=id',
  });
  const tenantId = page.value?.[0]?.id;

  if (!isNonEmptyString(tenantId)) {
    throw new Error('Microsoft Graph returned no organization to claim');
  }

  return tenantId;
};
