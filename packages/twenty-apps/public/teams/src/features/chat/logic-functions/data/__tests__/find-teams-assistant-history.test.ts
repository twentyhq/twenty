import { describe, expect, it, vi } from 'vitest';

import { TEAMS_ASSISTANT_FAILURE_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-failure-text';
import { TEAMS_ASSISTANT_REQUEST_STATUS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-status';
import { findTeamsAssistantHistory } from 'src/features/chat/logic-functions/data/find-teams-assistant-history';

const buildClient = (
  nodes: {
    status: string;
    requestText?: string | null;
    responseText?: string | null;
  }[],
) => ({
  query: vi.fn().mockResolvedValue({
    teamsAssistantRequests: {
      edges: nodes.map(({ status, requestText, responseText }) => ({
        node: {
          status,
          requestText: { markdown: requestText },
          responseText: { markdown: responseText },
        },
      })),
    },
  }),
});

const INPUT = {
  teamsConversationId: 'a:personal-conversation',
  workspaceMemberId: 'workspace-member-1',
};

describe('findTeamsAssistantHistory', () => {
  it('should return the latest answered turns of the member in chronological order', async () => {
    const client = buildClient([
      {
        status: TEAMS_ASSISTANT_REQUEST_STATUS.DONE,
        requestText: 'and their open deals?',
        responseText: '**Acme** has 3 open deals.',
      },
      {
        status: TEAMS_ASSISTANT_REQUEST_STATUS.DONE,
        requestText: 'list my companies',
        responseText: '**Acme**',
      },
    ]);

    await expect(
      findTeamsAssistantHistory({ client, ...INPUT }),
    ).resolves.toEqual([
      { requestText: 'list my companies', responseText: '**Acme**' },
      {
        requestText: 'and their open deals?',
        responseText: '**Acme** has 3 open deals.',
      },
    ]);
    expect(client.query).toHaveBeenCalledWith({
      teamsAssistantRequests: expect.objectContaining({
        __args: expect.objectContaining({
          filter: {
            teamsConversationId: { eq: INPUT.teamsConversationId },
            workspaceMemberId: { eq: INPUT.workspaceMemberId },
            status: {
              in: [
                TEAMS_ASSISTANT_REQUEST_STATUS.DONE,
                TEAMS_ASSISTANT_REQUEST_STATUS.FAILED,
              ],
            },
          },
          orderBy: [{ createdAt: 'DescNullsLast' }],
        }),
      }),
    });
  });

  it('should replay a failed turn with the failure reply the member saw', async () => {
    const client = buildClient([
      {
        status: TEAMS_ASSISTANT_REQUEST_STATUS.FAILED,
        requestText: 'list my companies',
        responseText: null,
      },
    ]);

    await expect(
      findTeamsAssistantHistory({ client, ...INPUT }),
    ).resolves.toEqual([
      {
        requestText: 'list my companies',
        responseText: TEAMS_ASSISTANT_FAILURE_TEXT,
      },
    ]);
  });

  it('should skip turns missing either side of the exchange', async () => {
    const client = buildClient([
      {
        status: TEAMS_ASSISTANT_REQUEST_STATUS.DONE,
        requestText: 'hi',
        responseText: '',
      },
      {
        status: TEAMS_ASSISTANT_REQUEST_STATUS.DONE,
        requestText: null,
        responseText: 'Hi!',
      },
    ]);

    await expect(
      findTeamsAssistantHistory({ client, ...INPUT }),
    ).resolves.toEqual([]);
  });
});
