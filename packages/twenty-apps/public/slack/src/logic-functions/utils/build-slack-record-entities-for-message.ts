import { type EntityMetadata } from '@slack/web-api';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_UNFURL_MAX_ENTITIES } from 'src/logic-functions/constants/slack-unfurl-max-entities';
import { extractHttpUrls } from 'src/logic-functions/utils/extract-http-urls';
import { fetchSlackRecordEntities } from 'src/logic-functions/utils/fetch-slack-record-entities';
import { fetchWorkspaceBaseUrls } from 'src/logic-functions/utils/fetch-workspace-base-urls';
import { parseTwentyRecordLinks } from 'src/logic-functions/utils/parse-twenty-record-links';

export const buildSlackRecordEntitiesForMessage = async (
  messageText: string,
): Promise<EntityMetadata[]> => {
  try {
    const urls = extractHttpUrls(messageText);

    // every record link carries this segment, so checking it first keeps the
    // workspace URL query off the post path for unrelated links
    const recordUrls = urls.filter((url) => url.includes('/object/'));

    if (recordUrls.length === 0) {
      return [];
    }

    const workspaceBaseUrls = await fetchWorkspaceBaseUrls();

    if (workspaceBaseUrls.length === 0) {
      return [];
    }

    const recordLinks = parseTwentyRecordLinks({
      workspaceBaseUrls,
      urls: recordUrls,
    }).slice(0, SLACK_UNFURL_MAX_ENTITIES);

    if (recordLinks.length === 0) {
      return [];
    }

    return await fetchSlackRecordEntities({
      client: new CoreApiClient(),
      recordLinks,
      workspaceBaseUrls,
    });
  } catch (error) {
    console.warn(
      `[slack] building record previews for an outgoing message failed: ${error instanceof Error ? error.message : String(error)}`,
    );

    return [];
  }
};
