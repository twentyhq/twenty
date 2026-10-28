import { type TeamsActivity } from 'src/features/chat/logic-functions/types/teams-activity.type';
import { type TeamsAssistantStatusWriter } from 'src/features/chat/logic-functions/types/teams-assistant-status-writer.type';
import { buildTeamsActivityPath } from 'src/features/chat/logic-functions/utils/build-teams-activity-path';
import { getTeamsConnectorAccessTokenOrThrow } from 'src/features/chat/logic-functions/utils/get-teams-connector-access-token-or-throw';
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

  // Follow-up stream calls answer 202 with no payload to parse.
  const sendStreamActivity = async (activity: TeamsActivity) => {
    await requestTeamsConnector({
      serviceUrl,
      path: buildTeamsActivityPath({ conversationId }),
      method: 'POST',
      accessToken: await getTeamsConnectorAccessTokenOrThrow(),
      body: activity,
    });
  };

  return {
    update: (text) => {
      streamSequence += 1;

      return sendStreamActivity({
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
      });
    },
    finish: (text) =>
      sendStreamActivity({
        type: 'message',
        text,
        entities: [{ type: 'streaminfo', streamId, streamType: 'final' }],
      }),
  };
};
