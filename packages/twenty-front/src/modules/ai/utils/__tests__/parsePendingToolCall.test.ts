import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { parsePendingToolCall } from '@/ai/utils/parsePendingToolCall';

const EMAIL = {
  recipients: { to: 'tim@apple.dev', cc: '', bcc: '' },
  subject: 'Renewal',
  body: 'Hi Tim',
};

const QUESTIONS = [{ header: 'Plan', question: 'Which plan?', options: [] }];

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
      'questions',
      toolPart({ toolName: 'ask_questions', input: { questions: QUESTIONS } }),
      { toolCallId: 'call-1', kind: 'questions', questions: QUESTIONS },
    ],
    [
      'an email to review',
      toolPart({ toolName: 'propose_email', input: EMAIL }),
      { toolCallId: 'call-1', kind: 'emailApproval', email: EMAIL },
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
      'questions without any question',
      toolPart({ toolName: 'ask_questions', input: { questions: [] } }),
    ],
    [
      'an email without a subject',
      toolPart({
        toolName: 'propose_email',
        input: { ...EMAIL, subject: undefined },
      }),
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

  it('ignores a tool call to approve without its proposal', () => {
    expect(
      parsePendingToolCall(
        toolPart({
          toolName: 'propose_tool_call',
          input: { toolName: 'x', arguments: {}, summary: 'Do x' },
        }),
      ),
    ).toBeNull();
  });
});
