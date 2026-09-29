import { type AskQuestionAnswer } from 'twenty-shared/ai';

import { type AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AiChatFileAttachment } from 'src/engine/metadata-modules/ai/ai-chat/types/ai-chat-file-attachment.type';
import { AgentChatWorkflowQuestionService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-workflow-question.service';
import { type AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';

const WORKSPACE_ID = 'workspace-id';
const WORKFLOW_RUN_ID = 'workflow-run-id';
const THREAD_ID = 'thread-id';
const QUESTION_MESSAGE_ID = 'question-message-id';
const ANSWER_MESSAGE_ID = 'answer-message-id';

const ROLLBACK = { partId: 'part-id', previousOutput: {} };

describe('AgentChatWorkflowQuestionService', () => {
  const messageRepository = { delete: jest.fn() };

  const agentChatService = {
    resolvePendingQuestion: jest.fn(),
    addMessage: jest.fn(),
    restorePendingQuestion: jest.fn(),
    closePendingQuestion: jest.fn(),
  };

  const permissionsService = {
    userHasWorkspaceSettingPermission: jest.fn(),
  };

  const workflowRunnerWorkspaceService = {
    resumeAgentStepWithAnswer: jest.fn(),
  };

  const service = new AgentChatWorkflowQuestionService(
    messageRepository as unknown as AgentHistoryRepository<AgentMessageEntity>,
    agentChatService as unknown as AgentChatService,
    permissionsService as unknown as PermissionsService,
    workflowRunnerWorkspaceService as unknown as WorkflowRunnerWorkspaceService,
  );

  const answers: AskQuestionAnswer[] = [
    { questionIndex: 0, selectedOptionIndices: [0] },
  ];

  const answer = (
    overrides: {
      answers?: AskQuestionAnswer[];
      fileAttachments?: AiChatFileAttachment[];
    } = {},
  ) =>
    service.answer({
      thread: {
        id: THREAD_ID,
        workflowRunId: WORKFLOW_RUN_ID,
      } as AgentChatThreadWorkspaceEntity & { workflowRunId: string },
      messageId: QUESTION_MESSAGE_ID,
      answers,
      userWorkspaceId: 'user-workspace-id',
      workspaceId: WORKSPACE_ID,
      ...overrides,
    });

  beforeEach(() => {
    jest.clearAllMocks();
    permissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
      true,
    );
    agentChatService.resolvePendingQuestion.mockResolvedValue({
      answerText: 'Send the quote?\nSend it',
      turnId: 'turn-id',
      rollback: ROLLBACK,
    });
    agentChatService.addMessage.mockResolvedValue({ id: ANSWER_MESSAGE_ID });
    messageRepository.delete.mockResolvedValue(undefined);
    workflowRunnerWorkspaceService.resumeAgentStepWithAnswer.mockResolvedValue({
      status: 'AWAITING_ANSWER',
      stepId: 'agent-step-id',
    });
  });

  it('claims the question without a stream, records the answer and resumes the step', async () => {
    await answer();

    expect(agentChatService.resolvePendingQuestion).toHaveBeenCalledWith({
      threadId: THREAD_ID,
      messageId: QUESTION_MESSAGE_ID,
      answers,
      streamId: null,
      workspaceId: WORKSPACE_ID,
    });
    expect(agentChatService.addMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: THREAD_ID,
        uiMessage: {
          role: 'user',
          parts: [{ type: 'text', text: 'Send the quote?\nSend it' }],
        },
      }),
    );
    expect(
      workflowRunnerWorkspaceService.resumeAgentStepWithAnswer,
    ).toHaveBeenCalledWith({
      threadId: THREAD_ID,
      workflowRunId: WORKFLOW_RUN_ID,
      workspaceId: WORKSPACE_ID,
    });
    expect(messageRepository.delete).not.toHaveBeenCalled();
    expect(agentChatService.restorePendingQuestion).not.toHaveBeenCalled();
  });

  it('refuses an answer that says nothing', async () => {
    await expect(
      answer({
        answers: [
          { questionIndex: 0, selectedOptionIndices: [], freeText: ' ' },
        ],
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_QUESTION_ANSWER });
    expect(agentChatService.resolvePendingQuestion).not.toHaveBeenCalled();
  });

  it('refuses attachments rather than dropping them', async () => {
    await expect(
      answer({
        fileAttachments: [{ id: 'file-id', filename: 'quote.pdf' }],
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_QUESTION_ANSWER });
    expect(agentChatService.resolvePendingQuestion).not.toHaveBeenCalled();
  });

  it('refuses someone without the Workflows permission before claiming anything', async () => {
    permissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
      false,
    );

    await expect(answer()).rejects.toMatchObject({
      code: AiExceptionCode.WORKFLOW_RUN_QUESTION_FORBIDDEN,
    });
    expect(agentChatService.resolvePendingQuestion).not.toHaveBeenCalled();
  });

  it('gives the question back when the step has asked but is not parked yet', async () => {
    workflowRunnerWorkspaceService.resumeAgentStepWithAnswer.mockResolvedValue({
      status: 'NOT_YET_AWAITING',
    });

    await expect(answer()).rejects.toMatchObject({
      code: AiExceptionCode.QUESTION_NOT_PENDING,
    });
    expect(messageRepository.delete).toHaveBeenCalledWith(WORKSPACE_ID, {
      id: ANSWER_MESSAGE_ID,
    });
    expect(agentChatService.restorePendingQuestion).toHaveBeenCalledWith({
      threadId: THREAD_ID,
      messageId: QUESTION_MESSAGE_ID,
      streamId: null,
      workspaceId: WORKSPACE_ID,
      rollback: ROLLBACK,
    });
    expect(agentChatService.closePendingQuestion).not.toHaveBeenCalled();
  });

  it('closes a question nothing can resume any more', async () => {
    workflowRunnerWorkspaceService.resumeAgentStepWithAnswer.mockResolvedValue({
      status: 'NO_LONGER_AWAITING',
    });

    await expect(answer()).rejects.toMatchObject({
      code: AiExceptionCode.QUESTION_NOT_PENDING,
    });
    expect(messageRepository.delete).toHaveBeenCalled();
    expect(agentChatService.closePendingQuestion).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      rollback: ROLLBACK,
    });
    expect(agentChatService.restorePendingQuestion).not.toHaveBeenCalled();
  });

  it('gives the question back when the resume cannot be scheduled', async () => {
    workflowRunnerWorkspaceService.resumeAgentStepWithAnswer.mockRejectedValue(
      new Error('Queue unavailable'),
    );

    await expect(answer()).rejects.toThrow('Queue unavailable');
    expect(messageRepository.delete).toHaveBeenCalled();
    expect(agentChatService.restorePendingQuestion).toHaveBeenCalledWith(
      expect.objectContaining({
        streamId: null,
        messageId: QUESTION_MESSAGE_ID,
      }),
    );
  });
});
