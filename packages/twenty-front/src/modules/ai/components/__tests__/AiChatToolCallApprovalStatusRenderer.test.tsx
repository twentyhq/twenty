import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { type ToolUIPart } from 'ai';

import { AiChatToolCallApprovalStatusRenderer } from '@/ai/components/AiChatToolCallApprovalStatusRenderer';

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

    expect(
      screen.getByText('Action could not be proposed'),
    ).toBeInTheDocument();
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

    expect(
      screen.getByText('Action could not be proposed'),
    ).toBeInTheDocument();
    expect(screen.getByText('Registry unavailable')).toBeInTheDocument();
  });

  it('reports an email that could not be proposed', () => {
    renderStatus({
      state: 'output-error',
      input: { toolName: 'send_email', arguments: {}, summary: 'Follow up' },
      errorText: 'No connected account',
    });

    expect(screen.getByText('Email could not be proposed')).toBeInTheDocument();
  });

  it('reads an email from its tool before the proposal is resolved', () => {
    renderStatus({
      state: 'input-available',
      input: { toolName: 'send_email', arguments: {}, summary: 'Follow up' },
    });

    expect(screen.getByText('Drafting an email...')).toBeInTheDocument();
  });
});
