import { type MessageAttachment } from '@slack/web-api';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_MAX_UNFURLED_LINKS } from 'src/logic-functions/constants/slack-max-unfurled-links';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { type SlackLinkUnfurlResult } from 'src/logic-functions/types/slack-link-unfurl-result.type';
import { buildSlackRecordUnfurlAttachment } from 'src/logic-functions/utils/build-slack-record-unfurl-attachment';
import { fetchSlackRecordUnfurlCard } from 'src/logic-functions/utils/fetch-slack-record-unfurl-card';
import { fetchWorkspaceBaseUrl } from 'src/logic-functions/utils/fetch-workspace-base-url';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { parseSlackLinkSharedEvent } from 'src/logic-functions/utils/parse-slack-link-shared-event';
import { parseSlackRecordLink } from 'src/logic-functions/utils/parse-slack-record-link';

export const unfurlSlackRecordLinks = async (
  body: SlackEventsRequestBody,
): Promise<SlackLinkUnfurlResult> => {
  const parsed = parseSlackLinkSharedEvent(body);

  if (parsed.linkShared === null) {
    return { ok: true, skipped: parsed.skipReason };
  }

  const workspaceBaseUrl = await fetchWorkspaceBaseUrl();

  if (!isDefined(workspaceBaseUrl)) {
    return { ok: true, skipped: 'Workspace base URL is not available' };
  }

  const recordLinks = parsed.linkShared.linkUrls
    .map((linkUrl) => parseSlackRecordLink({ linkUrl, workspaceBaseUrl }))
    .filter(isDefined)
    .slice(0, SLACK_MAX_UNFURLED_LINKS);

  if (recordLinks.length === 0) {
    return { ok: true, skipped: 'No record links to unfurl' };
  }

  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return { ok: true, skipped: slackClientResult.error };
  }

  const cards = await Promise.all(
    recordLinks.map(async (recordLink) => ({
      recordLink,
      card: await fetchSlackRecordUnfurlCard(recordLink),
    })),
  );

  const unfurls: Record<string, MessageAttachment> = {};

  for (const { recordLink, card } of cards) {
    if (!isDefined(card)) {
      continue;
    }

    unfurls[recordLink.linkUrl] = buildSlackRecordUnfurlAttachment({
      recordUrl: recordLink.recordUrl,
      card,
    });
  }

  const unfurledLinkCount = Object.keys(unfurls).length;

  if (unfurledLinkCount === 0) {
    return { ok: true, skipped: 'No resolvable records for the shared links' };
  }

  try {
    await slackClientResult.client.chat.unfurl({
      channel: parsed.linkShared.slackChannelId,
      ts: parsed.linkShared.messageTimestamp,
      unfurls,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.warn(`[slack] chat.unfurl failed: ${message}`);

    return { ok: false, error: message };
  }

  return { ok: true, unfurledLinkCount };
};
