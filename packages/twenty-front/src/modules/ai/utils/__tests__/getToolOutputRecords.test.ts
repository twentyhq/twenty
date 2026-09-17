import { type ToolUIPart } from 'ai';

import { getToolOutputRecords } from '@/ai/utils/getToolOutputRecords';

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

describe('getToolOutputRecords', () => {
  it('reads the record references a record tool answered with', () => {
    expect(
      getToolOutputRecords(
        buildToolPart('output-available', {
          success: true,
          recordReferences: [recordReference],
        }),
      ),
    ).toEqual([recordReference]);
  });

  it('returns nothing while the call has not produced output', () => {
    expect(
      getToolOutputRecords(buildToolPart('input-available', undefined)),
    ).toEqual([]);
  });

  it('returns nothing when the output carries no record references', () => {
    expect(
      getToolOutputRecords(
        buildToolPart('output-available', { success: true, result: { a: 1 } }),
      ),
    ).toEqual([]);
  });

  it('returns nothing when a reference is malformed', () => {
    expect(
      getToolOutputRecords(
        buildToolPart('output-available', {
          recordReferences: [{ objectNameSingular: 'company' }],
        }),
      ),
    ).toEqual([]);
  });
});
