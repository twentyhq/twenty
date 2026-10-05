import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { parsePendingToolCall } from '@/ai/utils/parsePendingToolCall';

const QUESTIONS = [{ header: 'Plan', question: 'Which plan?', options: [] }];

const QUESTION = {
  header: 'Plan',
  question: 'Which plan?',
  options: [{ label: 'Pro' }, { label: 'Team' }],
};

const FIELDS = [{ name: 'closeDate', label: 'Close date', type: 'DATE' }];

const toolPart = ({
  toolName,
  input,
  status = 'pending',
}: {
  toolName: string;
  input: unknown;
  status?: string;
}) =>
  ({
    type: `tool-${toolName}`,
    toolCallId: 'call-1',
    state: 'output-available',
    input,
    output: { success: true, result: { status } },
  }) as unknown as ExtendedUIMessagePart;

describe('parsePendingToolCall', () => {
  it.each([
    [
      'a question',
      toolPart({ toolName: 'ask_question', input: QUESTION }),
      { toolCallId: 'call-1', kind: 'question', question: QUESTION },
    ],
    [
      'questions asked before ask_question',
      toolPart({ toolName: 'ask_questions', input: { questions: QUESTIONS } }),
      { toolCallId: 'call-1', kind: 'questions', questions: QUESTIONS },
    ],
    [
      'a form',
      toolPart({ toolName: 'request_form', input: { fields: FIELDS } }),
      { toolCallId: 'call-1', kind: 'form', fields: FIELDS },
    ],
  ])('reads %s still waiting on an answer', (_description, part, expected) => {
    expect(parsePendingToolCall(part)).toEqual(expected);
  });

  it.each([
    ['a text part', { type: 'text', text: 'Hi' } as ExtendedUIMessagePart],
    [
      'a call already answered',
      toolPart({
        toolName: 'ask_questions',
        input: { questions: QUESTIONS },
        status: 'answered',
      }),
    ],
    [
      'a tool that does not pause',
      toolPart({ toolName: 'search_help_center', input: {} }),
    ],
    [
      'a question without options',
      toolPart({
        toolName: 'ask_question',
        input: { ...QUESTION, options: [] },
      }),
    ],
    [
      'questions without any question',
      toolPart({ toolName: 'ask_questions', input: { questions: [] } }),
    ],
    [
      'a form without fields',
      toolPart({ toolName: 'request_form', input: { fields: [] } }),
    ],
  ])('ignores %s', (_description, part) => {
    expect(parsePendingToolCall(part)).toBeNull();
  });

  it('reads a tool call to approve from the proposal the server resolved', () => {
    const proposal = {
      toolName: 'update_one_company',
      toolLabel: 'Update Company',
      summary: 'Fix the headcount',
      arguments: { id: 'company-id', employees: 25 },
      template: 'recordUpdate',
      objectNameSingular: 'company',
      recordId: 'company-id',
      currentValues: { employees: 10 },
    };
    const part = {
      type: 'tool-propose_tool_call',
      toolCallId: 'call-1',
      state: 'output-available',
      input: {
        toolName: proposal.toolName,
        arguments: proposal.arguments,
        summary: proposal.summary,
      },
      output: { success: true, result: { status: 'pending', proposal } },
    } as unknown as ExtendedUIMessagePart;

    expect(parsePendingToolCall(part)).toEqual({
      toolCallId: 'call-1',
      kind: 'toolCallApproval',
      proposal,
    });
  });

  it('reads a tool call to approve without its proposal as a generic one', () => {
    expect(
      parsePendingToolCall(
        toolPart({
          toolName: 'propose_tool_call',
          input: { toolName: 'http_request', arguments: {}, summary: 'Ping' },
        }),
      ),
    ).toEqual({
      toolCallId: 'call-1',
      kind: 'toolCallApproval',
      proposal: {
        toolName: 'http_request',
        toolLabel: 'http_request',
        summary: 'Ping',
        arguments: {},
        template: 'generic',
      },
    });
  });

  it('ignores a tool call to approve whose input cannot be read', () => {
    expect(
      parsePendingToolCall(
        toolPart({ toolName: 'propose_tool_call', input: { toolName: 'x' } }),
      ),
    ).toBeNull();
  });
});
