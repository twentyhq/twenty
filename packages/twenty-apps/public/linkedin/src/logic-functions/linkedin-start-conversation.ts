import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { getConnection } from 'twenty-sdk/logic-function';

import { LINKEDIN_START_CONVERSATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildLinkedinProfileHandle } from 'src/logic-functions/utils/build-linkedin-profile-handle.util';
import { getLinkedinProfileIdentifier } from 'src/logic-functions/utils/get-linkedin-profile-identifier.util';
import { getPersonLinkedinLink } from 'src/logic-functions/utils/get-person-linkedin-link.util';
import { isLinkedinInternalProfileId } from 'src/logic-functions/utils/is-linkedin-internal-profile-id.util';
import {
  type StartAppConversationPayload,
  type StartAppConversationResult,
} from 'src/types/start-app-conversation.type';
import { getUnipileUser } from 'src/unipile/utils/get-unipile-user.util';
import { startUnipileChatOrThrow } from 'src/unipile/utils/start-unipile-chat-or-throw.util';

const resolveProfileIdentifier = async ({
  handle,
  personId,
}: {
  handle: string | null;
  personId: string;
}): Promise<string | null> => {
  const knownProfileIdentifier = getLinkedinProfileIdentifier(handle ?? '');

  if (
    isNonEmptyString(knownProfileIdentifier) &&
    !isLinkedinInternalProfileId(knownProfileIdentifier)
  ) {
    return knownProfileIdentifier;
  }

  return getLinkedinProfileIdentifier(
    (await getPersonLinkedinLink(personId)) ?? '',
  );
};

export const linkedinStartConversationHandler = async ({
  connectedAccountId,
  recipients,
  text,
}: StartAppConversationPayload): Promise<StartAppConversationResult> => {
  const [recipient] = recipients;

  if (recipients.length !== 1 || recipient === undefined) {
    throw new Error(
      'A LinkedIn conversation can only be started with one person',
    );
  }

  const connection = await getConnection(connectedAccountId);
  const unipileAccountId = connection.externalAccountId;

  if (!isNonEmptyString(unipileAccountId)) {
    throw new Error(
      `LinkedIn connection ${connectedAccountId} has no Unipile account`,
    );
  }

  const profileIdentifier = await resolveProfileIdentifier(recipient);

  if (profileIdentifier === null) {
    throw new Error(
      `Person ${recipient.personId} has no LinkedIn profile URL: add one to start a LinkedIn conversation`,
    );
  }

  const user = await getUnipileUser({
    accountId: unipileAccountId,
    userId: profileIdentifier,
    deadlineAtMs: Date.now(),
  });

  const { chatId, messageId } = await startUnipileChatOrThrow({
    accountId: unipileAccountId,
    userId: user.id,
    text,
  });

  return {
    externalId: messageId,
    threadExternalId: chatId,
    recipients: [
      {
        personId: recipient.personId,
        handle: recipient.handle ?? buildLinkedinProfileHandle(user),
      },
    ],
  };
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_START_CONVERSATION_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-start-conversation',
  description:
    'Starts a LinkedIn conversation with a Person from Twenty by sending the first message through Unipile.',
  timeoutSeconds: 20,
  handler: linkedinStartConversationHandler,
});
