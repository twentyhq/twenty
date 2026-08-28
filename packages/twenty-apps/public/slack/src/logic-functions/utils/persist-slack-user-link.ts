import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { createSlackUserLink } from 'src/logic-functions/data/create-slack-user-link';
import { deleteSlackUserLink } from 'src/logic-functions/data/delete-slack-user-link';
import { updateSlackUserLink } from 'src/logic-functions/data/update-slack-user-link';
import { type SlackUserLink } from 'src/logic-functions/types/slack-user-link.type';
import { type SlackUserLinkConsentState } from 'src/logic-functions/types/slack-user-link-consent-state.type';
import { type SlackUserLinkSource } from 'src/logic-functions/types/slack-user-link-source.type';

// A same-member re-save updates in place. Re-pointing a link to another
// member deletes and recreates it so the record gets a fresh id: the consent
// handler refuses a decision whose link id no longer matches the stored
// record, so a consent DM sent for the old assignment can never activate the
// new one, even when the approval races the re-point.
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

  // Only a same-member re-save may leave the states untouched; a new record
  // is a permission grant and must never fall back to an implicit state.
  // Checked before the delete so a bad call cannot destroy the old link.
  if (!isDefined(source) || !isDefined(consentState)) {
    throw new Error(
      'A new Slack user link needs an explicit source and consent state',
    );
  }

  if (isDefined(existingLink)) {
    await deleteSlackUserLink(client, { id: existingLink.id });
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
