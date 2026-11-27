import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { cancelPendingAiChatToolCallApprovals } from '@/ai-chat/tool-calls/utils/cancelPendingAiChatToolCallApprovals';

const PROPOSAL = {
  toolName: 'update_record',
  toolLabel: 'Update Record',
  summary: 'Move the Acme renewal to won',
  arguments: { stage: 'WON' },
  template: 'generic',
};

const buildApprovalPart = ({
  toolCallId,
  status,
}: {
  toolCallId: string;
  status: string;
}) => ({
  type: 'tool-propose_tool_call' as const,
  toolCallId,
  state: 'output-available' as const,
  input: {
    toolName: PROPOSAL.toolName,
    arguments: PROPOSAL.arguments,
    summary: PROPOSAL.summary,
  },
  output: {
    success: true,
    message: 'Tool call proposed to the user; awaiting their decision.',
    result: { status, proposal: PROPOSAL },
  },
});

describe('cancelPendingAiChatToolCallApprovals', () => {
  it('marks a pending approval as cancelled and keeps its proposal', () => {
    const messages: ExtendedUIMessage[] = [
      {
        id: 'assistant-1',
        role: 'assistant',
        parts: [
          { type: 'text', text: 'I need your approval' },
          buildApprovalPart({ toolCallId: 'call-1', status: 'pending' }),
        ],
      },
    ];

    const [message] = cancelPendingAiChatToolCallApprovals({
      messages,
      toolCallIds: ['call-1'],
    });

    expect(message.parts[0]).toBe(messages[0].parts[0]);
    expect(message.parts[1]).toMatchObject({
      toolCallId: 'call-1',
      output: {
        success: true,
        result: { status: 'skipped', proposal: PROPOSAL },
      },
    });
  });

  it('leaves answered approvals and pending questions as they are', () => {
    const messages: ExtendedUIMessage[] = [
      {
        id: 'assistant-1',
        role: 'assistant',
        parts: [
          buildApprovalPart({ toolCallId: 'call-1', status: 'approved' }),
        ],
      },
      {
        id: 'assistant-2',
        role: 'assistant',
        parts: [
          {
            type: 'tool-ask_question',
            toolCallId: 'call-2',
            state: 'output-available',
            input: {
              question: 'Which plan?',
              options: [{ label: 'Pro' }, { label: 'Team' }],
            },
            output: { result: { status: 'pending' } },
          },
        ],
      },
    ];

    const result = cancelPendingAiChatToolCallApprovals({
      messages,
      toolCallIds: ['call-1', 'call-2'],
    });

    expect(result[0]).toBe(messages[0]);
    expect(result[1]).toBe(messages[1]);
  });

  it('leaves a pending approval it was not asked to cancel', () => {
    const messages: ExtendedUIMessage[] = [
      {
        id: 'assistant-1',
        role: 'assistant',
        parts: [
          buildApprovalPart({ toolCallId: 'call-1', status: 'pending' }),
          buildApprovalPart({ toolCallId: 'call-2', status: 'pending' }),
        ],
      },
    ];

    const [message] = cancelPendingAiChatToolCallApprovals({
      messages,
      toolCallIds: ['call-1'],
    });

    expect(message.parts[0]).toMatchObject({
      output: { result: { status: 'skipped' } },
    });
    expect(message.parts[1]).toBe(messages[0].parts[1]);
  });
});
