import { extractCompletedWorkspaceSetupToolParts } from '@/ai/utils/extractCompletedWorkspaceSetupToolParts';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

const completedPart = {
  type: 'tool-complete_workspace_setup',
  toolCallId: 'completed-call',
  input: {},
  output: { success: true, message: 'Setup marked as finished.' },
  state: 'output-available',
};

describe('extractCompletedWorkspaceSetupToolParts', () => {
  it('should keep only the completed workspace setup tool parts', () => {
    const messageParts = [
      { type: 'text', text: 'All set.' },
      {
        type: 'tool-execute_tool',
        toolCallId: 'navigate-call',
        input: { toolName: 'navigate_app' },
        output: { success: true, result: { action: 'navigateToObject' } },
        state: 'output-available',
      },
      completedPart,
    ] as ExtendedUIMessagePart[];

    expect(extractCompletedWorkspaceSetupToolParts(messageParts)).toEqual([
      { toolCallId: 'completed-call' },
    ]);
  });

  it('should ignore the tool part while its output has not landed yet', () => {
    const messageParts = [
      {
        type: 'tool-complete_workspace_setup',
        toolCallId: 'streaming-call',
        input: {},
        state: 'input-streaming',
      },
    ] as ExtendedUIMessagePart[];

    expect(extractCompletedWorkspaceSetupToolParts(messageParts)).toEqual([]);
  });

  it('should ignore the tool part when it did not succeed', () => {
    const messageParts = [
      {
        ...completedPart,
        output: { success: false, message: 'Something went wrong.' },
      },
    ] as ExtendedUIMessagePart[];

    expect(extractCompletedWorkspaceSetupToolParts(messageParts)).toEqual([]);
  });

  it('should ignore the tool part when it errored', () => {
    const messageParts = [
      {
        type: 'tool-complete_workspace_setup',
        toolCallId: 'errored-call',
        input: {},
        state: 'output-error',
        errorText: 'Tool execution failed',
      },
    ] as ExtendedUIMessagePart[];

    expect(extractCompletedWorkspaceSetupToolParts(messageParts)).toEqual([]);
  });

  it('should ignore an output that is not an object', () => {
    const messageParts = [
      { ...completedPart, output: 'done' },
    ] as ExtendedUIMessagePart[];

    expect(extractCompletedWorkspaceSetupToolParts(messageParts)).toEqual([]);
  });
});
