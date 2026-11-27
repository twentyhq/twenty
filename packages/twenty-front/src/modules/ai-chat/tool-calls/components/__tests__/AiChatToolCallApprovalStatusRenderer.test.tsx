import { AiChatTestInstance } from '@/ai-chat/testing/AiChatTestInstance';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { type ToolUIPart } from 'ai';

import { AiChatToolCallApprovalStatusRenderer } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalStatusRenderer';

const renderStatus = (toolPart: Partial<ToolUIPart>) =>
  render(
    <I18nProvider i18n={i18n}>
      <AiChatTestInstance>
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
      </AiChatTestInstance>
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

  it('names an approved call by its summary', () => {
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

    expect(screen.getByText('Follow up')).toBeInTheDocument();
    expect(screen.queryByText('Approved')).not.toBeInTheDocument();
  });

  it.each([undefined, 'Wait for the signed quote'])(
    'names a rejected call by its summary (feedback: %s)',
    (feedback) => {
      renderStatus({
        state: 'output-available',
        input: { toolName: 'update_record', arguments: {}, summary: 'Move' },
        output: {
          success: true,
          result: {
            status: 'rejected',
            feedback,
            proposal: {
              toolName: 'update_record',
              toolLabel: 'Update Record',
              summary: 'Move the Acme renewal to won',
              arguments: {},
              template: 'generic',
            },
          },
        },
      });

      expect(screen.getByText('Rejected')).toBeInTheDocument();
      expect(
        screen.getByText('Move the Acme renewal to won'),
      ).toBeInTheDocument();
    },
  );
});
