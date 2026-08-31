import { type WebClient } from '@slack/web-api';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { findSlackUnfurlRecord } from 'src/logic-functions/data/find-slack-unfurl-record';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { type SlackRecordLink } from 'src/logic-functions/types/slack-record-link.type';
import { buildSlackRecordUnfurlEntity } from 'src/logic-functions/utils/build-slack-record-unfurl-entity';
import { fetchWorkspaceBaseUrl } from 'src/logic-functions/utils/fetch-workspace-base-url';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { parseSlackEntityDetailsEvent } from 'src/logic-functions/utils/parse-slack-entity-details-event';
import { parseTwentyRecordLinks } from 'src/logic-functions/utils/parse-twenty-record-links';

type SlackRecordDetailsResult = {
  ok: boolean;
  skipped?: string;
  error?: string;
  presented?: boolean;
};

const presentDetailsError = async ({
  slackClient,
  triggerId,
  message,
}: {
  slackClient: WebClient;
  triggerId: string;
  message: string;
}): Promise<void> => {
  try {
    await slackClient.entity.presentDetails({
      trigger_id: triggerId,
      error: { status: 'custom', custom_message: message },
    });
  } catch (error) {
    console.warn(
      `[slack] entity.presentDetails error response failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

const resolveRecordLink = ({
  workspaceBaseUrl,
  entityUrl,
  externalRef,
}: {
  workspaceBaseUrl: string;
  entityUrl: string | undefined;
  externalRef: { id: string; type: string | undefined } | undefined;
}): SlackRecordLink | undefined => {
  // Rebuilding a URL from the external_ref reuses the URL parser as the
  // single validator of object names and record ids.
  const candidateUrls = [
    entityUrl,
    isDefined(externalRef?.type)
      ? `${workspaceBaseUrl}/object/${externalRef.type}/${externalRef.id}`
      : undefined,
  ].filter(isDefined);

  return parseTwentyRecordLinks({ workspaceBaseUrl, urls: candidateUrls })[0];
};

export const presentSlackRecordDetails = async (
  body: SlackEventsRequestBody,
): Promise<SlackRecordDetailsResult> => {
  const parsed = parseSlackEntityDetailsEvent(body);

  if (parsed.detailsRequest === null) {
    return { ok: true, skipped: parsed.skipReason };
  }

  const { triggerId, entityUrl, externalRef } = parsed.detailsRequest;

  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return { ok: true, skipped: slackClientResult.error };
  }

  const slackClient = slackClientResult.client;
  const workspaceBaseUrl = await fetchWorkspaceBaseUrl();

  if (!isDefined(workspaceBaseUrl)) {
    await presentDetailsError({
      slackClient,
      triggerId,
      message: 'The Twenty workspace URL is not configured.',
    });

    return { ok: true, skipped: 'Workspace URL is unavailable' };
  }

  const recordLink = resolveRecordLink({
    workspaceBaseUrl,
    entityUrl,
    externalRef,
  });

  if (!isDefined(recordLink)) {
    // Logged verbatim while the event schema settles, so an unrecognized
    // shape can be diagnosed from the logs.
    console.warn(
      `[slack] entity_details_requested carries no resolvable record: ${JSON.stringify(body.event)}`,
    );

    await presentDetailsError({
      slackClient,
      triggerId,
      message: 'This preview does not point to a Twenty record.',
    });

    return { ok: true, skipped: 'No resolvable record in the event' };
  }

  const record = await findSlackUnfurlRecord({
    client: new CoreApiClient(),
    objectNameSingular: recordLink.objectNameSingular,
    recordId: recordLink.recordId,
  }).catch(() => undefined);

  // The flexpane shows the full field set, read with the app's role-bounded
  // access; per-viewer gating is deferred until flexpane actions land.
  const entity = isDefined(record)
    ? buildSlackRecordUnfurlEntity({
        recordLink,
        record,
        workspaceBaseUrl,
        includeDetails: true,
      })
    : undefined;

  if (!isDefined(entity)) {
    await presentDetailsError({
      slackClient,
      triggerId,
      message: 'This record could not be found in Twenty.',
    });

    return { ok: true, skipped: 'Record is missing or unreadable' };
  }

  try {
    await slackClient.entity.presentDetails({
      trigger_id: triggerId,
      metadata: entity,
    });
  } catch (error) {
    console.warn(
      `[slack] entity.presentDetails failed: ${error instanceof Error ? error.message : String(error)}`,
    );

    return { ok: false, error: 'entity.presentDetails failed' };
  }

  return { ok: true, presented: true };
};
