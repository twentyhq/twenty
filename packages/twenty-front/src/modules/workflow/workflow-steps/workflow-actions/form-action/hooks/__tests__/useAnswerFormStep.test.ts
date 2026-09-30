import { renderHook } from '@testing-library/react';

import { useAnswerFormStep } from '@/workflow/workflow-steps/workflow-actions/form-action/hooks/useAnswerFormStep';

const mockMutate = jest.fn();
const mockQuery = jest.fn();
const mockAnswerToolCall = jest.fn();
let mockThreadId: string | undefined;

jest.mock('@/workflow/hooks/useWorkflowRun', () => ({
  useWorkflowRun: () => ({
    state: { stepInfos: { 'step-id': { threadId: mockThreadId } } },
  }),
}));

jest.mock('@/ai/hooks/useAnswerToolCall', () => ({
  useAnswerToolCall: () => ({ answerToolCall: mockAnswerToolCall }),
}));

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ mutate: mockMutate, query: mockQuery }),
}));

jest.mock('@/object-record/hooks/useFindOneRecordQuery', () => ({
  useFindOneRecordQuery: () => ({ findOneRecordQuery: 'workflow-run-query' }),
}));

describe('useAnswerFormStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockThreadId = undefined;
    mockAnswerToolCall.mockResolvedValue({ streamId: null });
    mockMutate.mockResolvedValue({ data: { submitFormStep: true } });
    mockQuery.mockResolvedValue({ data: {} });
  });

  it('submits by run and step without requiring a cached conversation ID', async () => {
    const { result } = renderHook(() =>
      useAnswerFormStep({ workflowRunId: 'run-id', stepId: 'step-id' }),
    );

    expect(await result.current.answerFormStep({ name: 'Tim' })).toBe(true);
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          input: {
            workflowRunId: 'run-id',
            stepId: 'step-id',
            response: { name: 'Tim' },
          },
        },
      }),
    );
    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { objectRecordId: 'run-id' },
        fetchPolicy: 'network-only',
      }),
    );
  });

  it('keeps submissions bound to the current conversation once it exists', async () => {
    mockThreadId = 'thread-id';
    const { result } = renderHook(() =>
      useAnswerFormStep({ workflowRunId: 'run-id', stepId: 'step-id' }),
    );

    expect(await result.current.answerFormStep({ name: 'Tim' })).toBe(true);
    expect(mockAnswerToolCall).toHaveBeenCalledWith({
      threadId: 'thread-id',
      toolCallId: 'step-id',
      response: { name: 'Tim' },
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('refreshes a run whose form was already answered or stopped', async () => {
    mockMutate.mockRejectedValue({ code: 'TOOL_CALL_NOT_PENDING' });
    const { result } = renderHook(() =>
      useAnswerFormStep({ workflowRunId: 'run-id', stepId: 'step-id' }),
    );

    expect(await result.current.answerFormStep({ name: 'Tim' })).toBe(false);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('propagates permission and transport errors', async () => {
    const error = new Error('Forbidden');
    mockMutate.mockRejectedValue(error);
    const { result } = renderHook(() =>
      useAnswerFormStep({ workflowRunId: 'run-id', stepId: 'step-id' }),
    );

    await expect(result.current.answerFormStep({ name: 'Tim' })).rejects.toBe(
      error,
    );
    expect(mockQuery).not.toHaveBeenCalled();
  });
});
