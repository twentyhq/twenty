import { type EntityMetadata } from '@slack/web-api';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_UNFURL_MAX_ENTITIES } from 'src/logic-functions/constants/slack-unfurl-max-entities';
import { extractHttpUrls } from 'src/logic-functions/utils/extract-http-urls';
import { fetchSlackRecordEntities } from 'src/logic-functions/utils/fetch-slack-record-entities';
import { fetchWorkspaceBaseUrl } from 'src/logic-functions/utils/fetch-workspace-base-url';
import { parseTwentyRecordLinks } from 'src/logic-functions/utils/parse-twenty-record-links';

// Slack never fires link_shared for an app's own messages, so record links
// the bot posts get their preview attached at post time instead. The bot's
// message content is decided upstream (the agent ran with the requester's
// permissions, workflow steps post what their author configured), so there
// is no poster gate here. Best-effort: any failure means no preview, never
// a failed post.
export const buildSlackRecordEntitiesForMessage = async (
  messageText: string,
): Promise<EntityMetadata[]> => {
  try {
    const urls = extractHttpUrls(messageText);

    if (urls.length === 0) {
      return [];
    }

    const workspaceBaseUrl = await fetchWorkspaceBaseUrl();

    if (!isDefined(workspaceBaseUrl)) {
      return [];
    }

    const recordLinks = parseTwentyRecordLinks({
      workspaceBaseUrl,
      urls,
    }).slice(0, SLACK_UNFURL_MAX_ENTITIES);

    if (recordLinks.length === 0) {
      return [];
    }

    return await fetchSlackRecordEntities({
      client: new CoreApiClient(),
      recordLinks,
      workspaceBaseUrl,
    });
  } catch (error) {
    console.warn(
      `[slack] building record previews for an outgoing message failed: ${error instanceof Error ? error.message : String(error)}`,
    );

    return [];
  }
};
