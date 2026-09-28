import { type ToolUIPart } from 'ai';

import { getToolRecordOutput } from '@/ai/utils/getToolRecordOutput';

const buildToolPart = (
  state: string,
  output: Record<string, unknown> | undefined,
): ToolUIPart =>
  ({
    type: 'tool-find_many_companies',
    toolCallId: 'call_1',
    state,
    input: {},
    output,
  }) as unknown as ToolUIPart;

const recordReference = {
  objectNameSingular: 'company',
  recordId: '20202020-a305-41e7-8c72-ba44072a4c58',
  displayName: 'Google',
};

describe('getToolRecordOutput', () => {
  it('reads the message and record references a record tool answered with', () => {
    expect(
      getToolRecordOutput(
        buildToolPart('output-available', {
          success: true,
          message: 'Found 1 company record',
          recordReferences: [recordReference],
        }),
      ),
    ).toEqual({
      message: 'Found 1 company record',
      recordReferences: [recordReference],
    });
  });

  it('reads the references of an output that carries no message', () => {
    expect(
      getToolRecordOutput(
        buildToolPart('output-available', {
          recordReferences: [recordReference],
        }),
      ),
    ).toEqual({ message: undefined, recordReferences: [recordReference] });
  });

  it('returns nothing while the call has not produced output', () => {
    expect(
      getToolRecordOutput(buildToolPart('input-available', undefined)),
    ).toEqual({ message: undefined, recordReferences: [] });
  });

  it('returns nothing when the output carries no record references', () => {
    expect(
      getToolRecordOutput(
        buildToolPart('output-available', { success: true, result: { a: 1 } }),
      ),
    ).toEqual({ message: undefined, recordReferences: [] });
  });

  it('returns nothing when a reference is malformed', () => {
    expect(
      getToolRecordOutput(
        buildToolPart('output-available', {
          recordReferences: [{ objectNameSingular: 'company' }],
        }),
      ),
    ).toEqual({ message: undefined, recordReferences: [] });
  });
});
