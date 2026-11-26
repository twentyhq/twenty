import { type TeamsActivity } from 'src/features/chat/logic-functions/types/teams-activity.type';
import { type TeamsAssistantStatusWriter } from 'src/features/chat/logic-functions/types/teams-assistant-status-writer.type';
import { buildTeamsActivityPath } from 'src/features/chat/logic-functions/utils/build-teams-activity-path';
import { buildTeamsMessageActivity } from 'src/features/chat/logic-functions/utils/build-teams-message-activity';
import { getTeamsConnectorAccessTokenOrThrow } from 'src/features/chat/logic-functions/utils/get-teams-connector-access-token-or-throw';
import { parseTeamsActivityId } from 'src/features/chat/logic-functions/utils/parse-teams-activity-id';
import { requestTeamsConnector } from 'src/features/chat/logic-functions/utils/request-teams-connector';
import { sendTeamsActivity } from 'src/features/chat/logic-functions/utils/send-teams-activity';

export const startTeamsAssistantStream = async ({
  serviceUrl,
  conversationId,
  text,
}: {
  serviceUrl: string;
  conversationId: string;
  text: string;
}): Promise<TeamsAssistantStatusWriter> => {
  let streamSequence = 1;
  const streamClosing = new AbortController();

  const { id: streamId } = await sendTeamsActivity({
    serviceUrl,
    conversationId,
    accessToken: await getTeamsConnectorAccessTokenOrThrow(),
    activity: {
      type: 'typing',
      text,
      entities: [
        { type: 'streaminfo', streamType: 'informative', streamSequence },
      ],
    },
  });

  // Follow-up stream calls can answer 202 with no payload.
  const sendStreamActivity = async ({
    activity,
    retryAbortSignal,
  }: {
    activity: TeamsActivity;
    retryAbortSignal?: AbortSignal;
  }) =>
    requestTeamsConnector({
      serviceUrl,
      path: buildTeamsActivityPath({ conversationId }),
      method: 'POST',
      accessToken: await getTeamsConnectorAccessTokenOrThrow(),
      body: activity,
      retryAbortSignal,
    });

  return {
    update: async (text) => {
      streamSequence += 1;

      await sendStreamActivity({
        activity: {
          type: 'typing',
          text,
          entities: [
            {
              type: 'streaminfo',
              streamId,
              streamType: 'informative',
              streamSequence,
            },
          ],
        },
        retryAbortSignal: streamClosing.signal,
      });
    },
    finish: async (text, answerMarkers) => {
      streamClosing.abort();

      const responseBody = await sendStreamActivity({
        activity: buildTeamsMessageActivity({
          text,
          ...answerMarkers,
          entities: [
            ...(answerMarkers?.entities ?? []),
            { type: 'streaminfo', streamId, streamType: 'final' },
          ],
        }),
      });

      return parseTeamsActivityId(responseBody) ?? streamId;
    },
  };
};
