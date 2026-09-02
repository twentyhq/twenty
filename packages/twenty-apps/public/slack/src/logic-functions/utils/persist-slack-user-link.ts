import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { createSlackUserLink } from 'src/logic-functions/data/create-slack-user-link';
import { destroySlackUserLink } from 'src/logic-functions/data/destroy-slack-user-link';
import { findDeletedSlackUserLinkIds } from 'src/logic-functions/data/find-deleted-slack-user-link-ids';
import { updateSlackUserLink } from 'src/logic-functions/data/update-slack-user-link';
import { type SlackUserLink } from 'src/logic-functions/types/slack-user-link.type';
import { type SlackUserLinkConsentState } from 'src/logic-functions/types/slack-user-link-consent-state.type';
import { type SlackUserLinkSource } from 'src/logic-functions/types/slack-user-link-source.type';

export const persistSlackUserLink = async (
  client: CoreApiClient,
  {
    existingLink,
    isSameMemberRelink,
    slackTeamId,
    slackUserId,
    workspaceMemberId,
    name,
    source,
    consentState,
  }: {
    existingLink: SlackUserLink | undefined;
    isSameMemberRelink: boolean;
    slackTeamId: string;
    slackUserId: string;
    workspaceMemberId: string;
    name: string | undefined;
    source: SlackUserLinkSource | undefined;
    consentState: SlackUserLinkConsentState | undefined;
  },
): Promise<string> => {
  if (isDefined(existingLink) && isSameMemberRelink) {
    await updateSlackUserLink(client, {
      id: existingLink.id,
      workspaceMemberId,
      name,
      source,
      consentState,
    });

    return existingLink.id;
  }

  if (!isDefined(source) || !isDefined(consentState)) {
    throw new Error(
      'A new Slack user link needs an explicit source and consent state',
    );
  }

  if (isDefined(existingLink)) {
    await destroySlackUserLink(client, { id: existingLink.id });
  } else {
    const [deletedLinkId] = await findDeletedSlackUserLinkIds(client, {
      slackTeamId,
      slackUserIds: [slackUserId],
    });

    if (isDefined(deletedLinkId)) {
      await destroySlackUserLink(client, { id: deletedLinkId });
    }
  }

  return createSlackUserLink(client, {
    slackTeamId,
    slackUserId,
    workspaceMemberId,
    name: isNonEmptyString(name) ? name : slackUserId,
    source,
    consentState,
  });
};
