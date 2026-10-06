import { describe, expect, it } from 'vitest';

import { type TeamsActivitiesDispatchPayload } from 'src/features/chat/logic-functions/types/teams-activities-dispatch-payload.type';
import { type TeamsInboundActivity } from 'src/features/chat/logic-functions/types/teams-inbound-activity.type';
import { parseTeamsAssistantRequest } from 'src/features/chat/logic-functions/utils/parse-teams-assistant-request';

const BOT_ID = '28:bot-app-id';
const SERVICE_URL = 'https://smba.trafficmanager.net/amer/';
const TENANT_ID = 'tenant-id';

const buildPayload = (
  activity: Partial<TeamsInboundActivity>,
): TeamsActivitiesDispatchPayload => ({
  activity: {
    type: 'message',
    id: '1700000000000',
    text: 'how many open deals does Acme have?',
    from: { id: '29:user-id', aadObjectId: 'aad-user-id' },
    recipient: { id: BOT_ID },
    conversation: {
      id: 'a:personal-conversation',
      conversationType: 'personal',
    },
    ...activity,
  },
  serviceUrl: SERVICE_URL,
  tenantId: TENANT_ID,
});

describe('parseTeamsAssistantRequest', () => {
  it('should turn a personal chat message into a request draft', () => {
    expect(parseTeamsAssistantRequest(buildPayload({}))).toEqual({
      request: {
        teamsActivityId: '1700000000000',
        teamsConversationId: 'a:personal-conversation',
        teamsConversationType: 'personal',
        teamsServiceUrl: SERVICE_URL,
        teamsTenantId: TENANT_ID,
        teamsUserId: '29:user-id',
        teamsUserAadObjectId: 'aad-user-id',
        requestText: 'how many open deals does Acme have?',
      },
    });
  });

  it('should strip the bot mention and keep other mentions as plain names', () => {
    const parsed = parseTeamsAssistantRequest(
      buildPayload({
        text: '<at>Twenty</at> assign the Acme deal to <at>John Smith</at>\n',
        conversation: {
          id: '19:channel@thread.tacv2;messageid=1699999999999',
          conversationType: 'channel',
        },
        entities: [
          {
            type: 'mention',
            text: '<at>Twenty</at>',
            mentioned: { id: BOT_ID },
          },
          {
            type: 'mention',
            text: '<at>John Smith</at>',
            mentioned: { id: '29:other-user-id' },
          },
        ],
      }),
    );

    expect(parsed.request).toMatchObject({
      teamsConversationType: 'channel',
      requestText: 'assign the Acme deal to John Smith',
    });
  });

  it('should skip a message that only mentions the bot', () => {
    expect(
      parseTeamsAssistantRequest(
        buildPayload({
          text: '<at>Twenty</at> ',
          entities: [
            {
              type: 'mention',
              text: '<at>Twenty</at>',
              mentioned: { id: BOT_ID },
            },
          ],
        }),
      ),
    ).toEqual({ request: null, skipReason: 'Empty request text' });
  });

  it('should skip messages sent by a bot', () => {
    expect(
      parseTeamsAssistantRequest(
        buildPayload({ from: { id: '28:other-bot', role: 'bot' } }),
      ),
    ).toEqual({ request: null, skipReason: 'Not a user message' });
    expect(
      parseTeamsAssistantRequest(buildPayload({ from: { id: BOT_ID } })),
    ).toEqual({ request: null, skipReason: 'Not a user message' });
  });
});
