import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_UNFURL_MAX_ENTITIES } from 'src/logic-functions/constants/slack-unfurl-max-entities';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { fetchSlackRecordEntities } from 'src/logic-functions/utils/fetch-slack-record-entities';
import { fetchSlackUserIdentity } from 'src/logic-functions/utils/fetch-slack-user-identity';
import { fetchWorkspaceBaseUrls } from 'src/logic-functions/utils/fetch-workspace-base-urls';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { parseSlackLinkSharedEvent } from 'src/logic-functions/utils/parse-slack-link-shared-event';
import { parseTwentyRecordLinks } from 'src/logic-functions/utils/parse-twenty-record-links';
import { resolveSlackRunAsWorkspaceMemberId } from 'src/logic-functions/utils/resolve-slack-run-as-workspace-member-id';

type SlackRecordUnfurlResult = {
  ok: boolean;
  skipped?: string;
  error?: string;
  unfurledCount?: number;
};

export const unfurlSlackRecordLinks = async (
  body: SlackEventsRequestBody,
): Promise<SlackRecordUnfurlResult> => {
  const parsed = parseSlackLinkSharedEvent(body);

  if (parsed.linkShared === null) {
    return { ok: true, skipped: parsed.skipReason };
  }

  const { unfurlTarget, slackUserId, urls } = parsed.linkShared;

  const workspaceBaseUrls = await fetchWorkspaceBaseUrls();

  if (workspaceBaseUrls.length === 0) {
    return { ok: true, skipped: 'Workspace URL is unavailable' };
  }

  const recordLinks = parseTwentyRecordLinks({ workspaceBaseUrls, urls }).slice(
    0,
    SLACK_UNFURL_MAX_ENTITIES,
  );

  if (recordLinks.length === 0) {
    return { ok: true, skipped: 'No Twenty record links in the message' };
  }

  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return { ok: true, skipped: slackClientResult.error };
  }

  const slackClient = slackClientResult.client;
  const client = new CoreApiClient();

  const identity = await fetchSlackUserIdentity({
    client: slackClient,
    slackUserId,
  });

  const workspaceMemberId = await resolveSlackRunAsWorkspaceMemberId({
    client,
    slackClient,
    identity,
  });

  if (!isNonEmptyString(workspaceMemberId)) {
    return {
      ok: true,
      skipped: 'Poster does not map to a workspace member',
    };
  }

  const entities = await fetchSlackRecordEntities({
    client,
    recordLinks,
    workspaceBaseUrls,
  });

  if (entities.length === 0) {
    return { ok: true, skipped: 'No readable records to unfurl' };
  }

  try {
    await slackClient.chat.unfurl(
      unfurlTarget.source === 'composer'
        ? {
            source: unfurlTarget.source,
            unfurl_id: unfurlTarget.unfurlId,
            metadata: { entities },
          }
        : {
            channel: unfurlTarget.slackChannelId,
            ts: unfurlTarget.messageTimestamp,
            metadata: { entities },
          },
    );
  } catch (error) {
    const targetLabel =
      unfurlTarget.source === 'composer'
        ? 'the message composer'
        : `channel ${unfurlTarget.slackChannelId}`;

    console.warn(
      `[slack] chat.unfurl failed in ${targetLabel}: ${error instanceof Error ? error.message : String(error)}`,
    );

    return { ok: false, error: 'chat.unfurl failed' };
  }

  return { ok: true, unfurledCount: entities.length };
};
