import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { findSlackUnfurlRecord } from 'src/logic-functions/data/find-slack-unfurl-record';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { type SlackRecordLink } from 'src/logic-functions/types/slack-record-link.type';
import { buildSlackRecordUnfurlEntity } from 'src/logic-functions/utils/build-slack-record-unfurl-entity';
import { fetchSlackUserIdentity } from 'src/logic-functions/utils/fetch-slack-user-identity';
import { fetchWorkspaceBaseUrls } from 'src/logic-functions/utils/fetch-workspace-base-urls';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { parseSlackEntityDetailsEvent } from 'src/logic-functions/utils/parse-slack-entity-details-event';
import { parseTwentyRecordLinks } from 'src/logic-functions/utils/parse-twenty-record-links';
import { resolveSlackRunAsWorkspaceMemberId } from 'src/logic-functions/utils/resolve-slack-run-as-workspace-member-id';

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
  workspaceBaseUrls,
  entityUrl,
  externalRef,
}: {
  workspaceBaseUrls: string[];
  entityUrl: string | undefined;
  externalRef: { id: string; type: string | undefined } | undefined;
}): SlackRecordLink | undefined => {
  const candidateUrls = [
    entityUrl,
    isDefined(externalRef?.type)
      ? `${workspaceBaseUrls[0]}/object/${externalRef.type}/${externalRef.id}`
      : undefined,
  ].filter(isDefined);

  return parseTwentyRecordLinks({ workspaceBaseUrls, urls: candidateUrls })[0];
};

export const presentSlackRecordDetails = async (
  body: SlackEventsRequestBody,
): Promise<SlackRecordDetailsResult> => {
  const parsed = parseSlackEntityDetailsEvent(body);

  if (parsed.detailsRequest === null) {
    return { ok: true, skipped: parsed.skipReason };
  }

  const { triggerId, slackUserId, entityUrl, externalRef } =
    parsed.detailsRequest;

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
    await presentDetailsError({
      slackClient,
      triggerId,
      message: 'Record details are only available to Twenty workspace members.',
    });

    return { ok: true, skipped: 'Viewer does not map to a workspace member' };
  }

  const workspaceBaseUrls = await fetchWorkspaceBaseUrls();

  if (workspaceBaseUrls.length === 0) {
    await presentDetailsError({
      slackClient,
      triggerId,
      message: 'The Twenty workspace URL is not configured.',
    });

    return { ok: true, skipped: 'Workspace URL is unavailable' };
  }

  const recordLink = resolveRecordLink({
    workspaceBaseUrls,
    entityUrl,
    externalRef,
  });

  if (!isDefined(recordLink)) {
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
    client,
    objectNameSingular: recordLink.objectNameSingular,
    recordId: recordLink.recordId,
  }).catch((error) => {
    console.warn(
      `[slack] record fetch for the flexpane failed (${recordLink.objectNameSingular} ${recordLink.recordId}): ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  });

  const entity = isDefined(record)
    ? buildSlackRecordUnfurlEntity({
        recordLink,
        record,
        workspaceBaseUrls,
        includeDetails: true,
      })
    : undefined;

  if (!isDefined(entity)) {
    await presentDetailsError({
      slackClient,
      triggerId,
      message: isDefined(record)
        ? 'This record has no name to show.'
        : 'This record could not be found in Twenty.',
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
