import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { type ToolUIPart } from 'ai';

import { AiChatToolCallApprovalStatusRenderer } from '@/ai/components/AiChatToolCallApprovalStatusRenderer';
import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';

jest.mock('@/ai/components/ChatReferenceChip', () => ({
  ChatReferenceChip: ({ reference }: { reference: ChatReferenceMatch }) => (
    <span data-testid="chat-reference-chip">{reference.displayName}</span>
  ),
}));

const renderStatus = (toolPart: Partial<ToolUIPart>) =>
  render(
    <I18nProvider i18n={i18n}>
      <AiChatToolCallApprovalStatusRenderer
        toolPart={
          {
            type: 'tool-propose_tool_call',
            toolCallId: 'call-1',
            ...toolPart,
          } as ToolUIPart
        }
        isStreaming={false}
      />
    </I18nProvider>,
  );

describe('AiChatToolCallApprovalStatusRenderer', () => {
  it('explains why a call could not be proposed', () => {
    renderStatus({
      state: 'output-available',
      input: { toolName: 'drop_everything', arguments: {}, summary: 'Drop' },
      output: {
        success: false,
        error: 'Tool "drop_everything" is not available here.',
      },
    });

    expect(screen.getByText('Could not be proposed')).toBeInTheDocument();
    expect(
      screen.getByText('Tool "drop_everything" is not available here.'),
    ).toBeInTheDocument();
  });

  it('reports a call that failed when it was made', () => {
    renderStatus({
      state: 'output-error',
      input: { toolName: 'update_one_company', arguments: {}, summary: 'Fix' },
      errorText: 'Registry unavailable',
    });

    expect(screen.getByText('Could not be proposed')).toBeInTheDocument();
    expect(screen.getByText('Registry unavailable')).toBeInTheDocument();
  });

  it('reads an approved call from its result', () => {
    renderStatus({
      state: 'output-available',
      input: { toolName: 'send_email', arguments: {}, summary: 'Follow up' },
      output: {
        success: true,
        result: {
          status: 'approved',
          proposal: {
            toolName: 'draft_email',
            toolLabel: 'Send Email',
            summary: 'Follow up',
            arguments: {},
            template: 'email',
          },
        },
      },
    });

    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Follow up')).toBeInTheDocument();
  });

  it('renders record references in the summary as chips', () => {
    const summary =
      'Rename [[record:task:3aa53376-dbbc-4fb1-8cd6-5f7d8e916496:dede]]';

    renderStatus({
      state: 'output-available',
      input: { toolName: 'update_one_task', arguments: {}, summary },
      output: {
        success: true,
        result: {
          status: 'approved',
          proposal: {
            toolName: 'update_one_task',
            toolLabel: 'Update Task',
            summary,
            arguments: {},
            template: 'recordUpdate',
          },
        },
      },
    });

    expect(screen.getByTestId('chat-reference-chip')).toHaveTextContent('dede');
    expect(screen.queryByText(/\[\[record:/)).not.toBeInTheDocument();
  });
});
