import { beforeEach, describe, expect, it, vi } from 'vitest';

import { teamsAssistantFeedbackHandler } from 'src/features/chat/logic-functions/handlers/teams-assistant-feedback-handler';
import { type TeamsInboundActivity } from 'src/features/chat/logic-functions/types/teams-inbound-activity.type';

const { coreApiClientMock, findRequestMock, updateFeedbackMock } = vi.hoisted(
  () => ({
    coreApiClientMock: vi.fn(function () {
      return {};
    }),
    findRequestMock: vi.fn(),
    updateFeedbackMock: vi.fn(),
  }),
);

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock(
  'src/features/chat/logic-functions/data/find-teams-assistant-request-by-answer-activity',
  () => ({ findTeamsAssistantRequestByAnswerActivity: findRequestMock }),
);

vi.mock(
  'src/features/chat/logic-functions/data/update-teams-assistant-request',
  () => ({
    updateTeamsAssistantRequest: updateFeedbackMock,
  }),
);

const FEEDBACK_ACTIVITY: TeamsInboundActivity = {
  type: 'invoke',
  name: 'message/submitAction',
  replyToId: 'answer-activity-1',
  from: { id: '29:user-1' },
  conversation: { id: 'conversation-1' },
  value: {
    actionName: 'feedback',
    actionValue: { reaction: 'dislike', feedback: '{"feedbackText":"Wrong"}' },
  },
};

describe('teamsAssistantFeedbackHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findRequestMock.mockResolvedValue({
      id: 'request-1',
      teamsUserId: '29:user-1',
    });
    updateFeedbackMock.mockResolvedValue(undefined);
  });

  it('should save the rating and comment on the request whose answer was rated', async () => {
    await expect(
      teamsAssistantFeedbackHandler({ activity: FEEDBACK_ACTIVITY }),
    ).resolves.toEqual({ done: true });

    expect(findRequestMock).toHaveBeenCalledExactlyOnceWith({
      client: expect.anything(),
      teamsConversationId: 'conversation-1',
      teamsAnswerActivityId: 'answer-activity-1',
    });
    expect(updateFeedbackMock).toHaveBeenCalledExactlyOnceWith({
      client: expect.anything(),
      id: 'request-1',
      feedbackRating: 'NEGATIVE',
      feedbackText: 'Wrong',
    });
  });

  it('should ignore feedback from someone other than the requester', async () => {
    await expect(
      teamsAssistantFeedbackHandler({
        activity: { ...FEEDBACK_ACTIVITY, from: { id: '29:user-2' } },
      }),
    ).resolves.toEqual({
      skipped: true,
      reason: 'Feedback is not from the member who made the request',
    });
    expect(updateFeedbackMock).not.toHaveBeenCalled();
  });

  it('should ignore feedback on a message that is not a recorded answer', async () => {
    findRequestMock.mockResolvedValue(undefined);

    await expect(
      teamsAssistantFeedbackHandler({ activity: FEEDBACK_ACTIVITY }),
    ).resolves.toEqual({
      skipped: true,
      reason: 'No request matches the rated answer',
    });
    expect(updateFeedbackMock).not.toHaveBeenCalled();
  });

  it.each([
    ['no replyToId', { ...FEEDBACK_ACTIVITY, replyToId: undefined }],
    ['no conversation', { ...FEEDBACK_ACTIVITY, conversation: undefined }],
    ['no sender', { ...FEEDBACK_ACTIVITY, from: undefined }],
    [
      'an unknown reaction',
      {
        ...FEEDBACK_ACTIVITY,
        value: { actionName: 'feedback', actionValue: { reaction: 'love' } },
      },
    ],
  ])('should skip feedback with %s', async (_, activity) => {
    await expect(
      teamsAssistantFeedbackHandler({ activity }),
    ).resolves.toMatchObject({ skipped: true });
    expect(findRequestMock).not.toHaveBeenCalled();
    expect(updateFeedbackMock).not.toHaveBeenCalled();
  });
});
