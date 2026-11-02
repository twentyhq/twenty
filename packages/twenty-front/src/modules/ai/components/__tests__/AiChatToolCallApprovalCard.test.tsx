import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import {
  PUBLISH_FRONT_COMPONENT_TOOL_NAME,
  type ProposedToolCall,
} from 'twenty-shared/ai';

import { AiChatToolCallApprovalCard } from '@/ai/components/AiChatToolCallApprovalCard';

type RecordFieldsStubProps = {
  values: Record<string, unknown>;
  onChange: (fieldName: string, value: unknown) => void;
};

const refreshFrontComponents = jest.fn();
jest.mock('@/ai/hooks/useRefreshFrontComponents', () => ({
  useRefreshFrontComponents: () => ({ refreshFrontComponents }),
}));

const answerAgentChatToolCall = jest.fn();
jest.mock('@/ai/hooks/useAnswerAgentChatToolCall', () => ({
  useAnswerAgentChatToolCall: () => ({ answerAgentChatToolCall }),
}));

// record fields need workspace metadata, so a stub stands in for them
const mockRecordFields = jest.fn(
  (_props: RecordFieldsStubProps): ReactNode => null,
);
jest.mock(
  '@/ai/components/internal/AiChatToolCallApprovalRecordFields',
  () => ({
    AiChatToolCallApprovalRecordFields: (props: RecordFieldsStubProps) =>
      mockRecordFields(props),
  }),
);
jest.mock('@/ai/components/internal/AiChatToolCallApprovalRecord', () => ({
  AiChatToolCallApprovalRecord: () => null,
}));
jest.mock('@/ai/components/internal/AiChatToolCallApprovalEmailCard', () => ({
  AiChatToolCallApprovalEmailCard: () => null,
}));

jest.mock('@/ai/components/AiChatFrontComponentPreviewContent', () => ({
  AiChatFrontComponentPreviewContent: ({ draftId }: { draftId: string }) => (
    <div role="region" aria-label={`Preview of ${draftId}`} />
  ),
}));

const mockUsePreview = jest.fn();
jest.mock('@/ai/hooks/useAiChatFrontComponentPreview', () => ({
  useAiChatFrontComponentPreview: (draftId: string) => mockUsePreview(draftId),
}));
const mockIsFeatureEnabled = jest.fn();
jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockIsFeatureEnabled(),
}));

const PROPOSAL: ProposedToolCall = {
  toolName: 'http_request',
  toolLabel: 'HTTP request',
  summary: 'Notify the billing system of the renewal',
  arguments: { url: 'https://billing.example.com', method: 'POST' },
  template: 'generic',
};

const renderCard = ({
  proposal = PROPOSAL,
  isActive = true,
}: {
  proposal?: ProposedToolCall;
  isActive?: boolean;
} = {}) =>
  render(
    <I18nProvider i18n={i18n}>
      <Provider store={createStore()}>
        <AiChatToolCallApprovalCard
          toolCallId="call-1"
          proposal={proposal}
          isActive={isActive}
        />
      </Provider>
    </I18nProvider>,
  );

describe('AiChatToolCallApprovalCard', () => {
  beforeEach(() => {
    answerAgentChatToolCall.mockReset();
    refreshFrontComponents.mockReset();
    mockUsePreview
      .mockReset()
      .mockReturnValue({ preview: { isCurrent: true } });
    mockIsFeatureEnabled.mockReset().mockReturnValue(true);
  });

  it('shows what the call does and which tool it runs', () => {
    renderCard();

    expect(screen.getByText(PROPOSAL.summary)).toBeInTheDocument();
    expect(screen.getByText('HTTP request')).toBeInTheDocument();
  });

  it('approves the call with the arguments as the person edited them', async () => {
    const user = userEvent.setup();
    answerAgentChatToolCall.mockReturnValue(new Promise(() => {}));

    renderCard();

    fireEvent.change(screen.getByRole('textbox', { name: 'Arguments' }), {
      target: { value: '{"url":"https://billing.example.com","method":"PUT"}' },
    });
    await user.click(screen.getByRole('button', { name: 'Approve' }));

    expect(answerAgentChatToolCall).toHaveBeenCalledWith({
      toolCallId: 'call-1',
      response: {
        decision: 'approve',
        arguments: { url: 'https://billing.example.com', method: 'PUT' },
      },
      optimisticToolOutput: undefined,
    });
    expect(screen.getByRole('button', { name: 'Reject' })).toBeDisabled();
  });

  it('cannot approve arguments that are not a JSON object', () => {
    renderCard();

    fireEvent.change(screen.getByRole('textbox', { name: 'Arguments' }), {
      target: { value: '{"url":' },
    });

    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    expect(
      screen.getByText('Arguments must be a valid JSON object.'),
    ).toBeInTheDocument();
  });

  it('cannot approve arguments that are valid JSON but not an object', () => {
    renderCard();

    fireEvent.change(screen.getByRole('textbox', { name: 'Arguments' }), {
      target: { value: '[]' },
    });

    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Arguments must be a valid JSON object.',
    );
  });

  it('keeps every edit to one composite field when approving a record', async () => {
    const user = userEvent.setup();
    answerAgentChatToolCall.mockReturnValue(new Promise(() => {}));
    // like the composite form inputs, each part is changed from the values it is given
    mockRecordFields.mockImplementation(({ values, onChange }) => {
      const name = values.name as Record<string, string>;

      return (
        <>
          <button
            onClick={() => onChange('name', { ...name, firstName: 'Grace' })}
          >
            Set first name
          </button>
          <button
            onClick={() => onChange('name', { ...name, lastName: 'Hopper' })}
          >
            Set last name
          </button>
        </>
      );
    });

    renderCard({
      proposal: {
        toolName: 'create_one_person',
        toolLabel: 'Create person',
        summary: 'Add the new contact',
        arguments: { name: { firstName: 'Ada', lastName: 'Lovelace' } },
        template: 'recordCreate',
        objectNameSingular: 'person',
      },
    });

    await user.click(screen.getByRole('button', { name: 'Set first name' }));
    await user.click(screen.getByRole('button', { name: 'Set last name' }));
    await user.click(screen.getByRole('button', { name: 'Approve' }));

    expect(answerAgentChatToolCall).toHaveBeenCalledWith(
      expect.objectContaining({
        response: {
          decision: 'approve',
          arguments: { name: { firstName: 'Grace', lastName: 'Hopper' } },
        },
      }),
    );
  });

  it('approves the call with the feedback the person wrote', async () => {
    const user = userEvent.setup();
    answerAgentChatToolCall.mockReturnValue(new Promise(() => {}));

    renderCard();

    await user.click(screen.getByRole('button', { name: 'Add feedback' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Feedback' }),
      'Use the staging URL next time',
    );
    await user.click(screen.getByRole('button', { name: 'Approve' }));

    expect(answerAgentChatToolCall).toHaveBeenCalledWith(
      expect.objectContaining({
        response: {
          decision: 'approve',
          arguments: PROPOSAL.arguments,
          feedback: 'Use the staging URL next time',
        },
      }),
    );
  });

  it('rejects the call with the feedback the person wrote', async () => {
    const user = userEvent.setup();
    answerAgentChatToolCall.mockResolvedValue(true);

    renderCard();

    await user.click(screen.getByRole('button', { name: 'Add feedback' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Feedback' }),
      'Wait for the signed quote',
    );
    await user.click(screen.getByRole('button', { name: 'Reject' }));

    expect(answerAgentChatToolCall).toHaveBeenCalledWith({
      toolCallId: 'call-1',
      response: { decision: 'reject', feedback: 'Wait for the signed quote' },
      optimisticToolOutput: {
        success: true,
        result: {
          status: 'rejected',
          proposal: PROPOSAL,
          feedback: 'Wait for the signed quote',
        },
      },
    });
  });
  it.each(['frontComponent', 'generic'] as const)(
    'shows a %s publication preview and approves its unchanged revision',
    async (template) => {
      const user = userEvent.setup();
      let completeApproval: (answered: boolean) => void = () => {};
      answerAgentChatToolCall.mockReturnValue(
        new Promise<boolean>((resolve) => {
          completeApproval = resolve;
        }),
      );
      const argumentsToApprove = {
        draftId: 'approved-draft',
        checksum: 'a'.repeat(64),
      };
      renderCard({
        proposal: {
          ...PROPOSAL,
          toolName: PUBLISH_FRONT_COMPONENT_TOOL_NAME,
          toolLabel: 'Save component',
          summary: 'Save Renewals as a dashboard component',
          arguments: argumentsToApprove,
          template,
        },
      });

      expect(
        screen.getByRole('region', { name: 'Preview of approved-draft' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('textbox', { name: 'Arguments' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(argumentsToApprove.checksum),
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Approve' }));
      expect(answerAgentChatToolCall).toHaveBeenCalledWith(
        expect.objectContaining({
          response: { decision: 'approve', arguments: argumentsToApprove },
        }),
      );
      expect(refreshFrontComponents).not.toHaveBeenCalled();
      await act(async () => completeApproval(true));
      await waitFor(() =>
        expect(refreshFrontComponents).toHaveBeenCalledTimes(1),
      );
    },
  );

  it('keeps ordinary tool arguments visible even when they contain a draft ID', () => {
    renderCard({
      proposal: { ...PROPOSAL, arguments: { draftId: 'other-tool-draft' } },
    });

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Arguments' })).toHaveValue(
      JSON.stringify({ draftId: 'other-tool-draft' }, null, 2),
    );
  });

  it.each([undefined, '', 42])(
    'does not load a preview for invalid draft ID %s',
    (draftId) => {
      renderCard({
        proposal: {
          ...PROPOSAL,
          toolName: PUBLISH_FRONT_COMPONENT_TOOL_NAME,
          arguments: { draftId },
        },
      });

      expect(screen.queryByRole('region')).not.toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Could not load preview.',
      );
      expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    },
  );

  it.each([
    { state: 'loading', preview: undefined, error: undefined },
    { state: 'superseded', preview: { isCurrent: false }, error: undefined },
    {
      state: 'failed',
      preview: { isCurrent: true },
      error: 'Could not load preview.',
    },
  ])(
    'blocks approval when the preview is $state',
    async ({ preview, error }) => {
      mockUsePreview.mockReturnValue({ preview, error });
      renderCard({
        proposal: {
          ...PROPOSAL,
          template: 'frontComponent',
          arguments: { draftId: 'current' },
        },
      });

      expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Reject' })).toBeEnabled();
      await userEvent.click(screen.getByRole('button', { name: 'Approve' }));
      expect(answerAgentChatToolCall).not.toHaveBeenCalled();
    },
  );

  it('blocks approval and explains an unavailable feature', () => {
    mockIsFeatureEnabled.mockReturnValue(false);
    renderCard({
      proposal: {
        ...PROPOSAL,
        template: 'frontComponent',
        arguments: { draftId: 'current' },
      },
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Could not load preview.',
    );
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeEnabled();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('does not mount the preview loader for an inactive approval', () => {
    renderCard({
      proposal: {
        ...PROPOSAL,
        template: 'frontComponent',
        arguments: { draftId: 'hidden' },
      },
      isActive: false,
    });

    expect(mockUsePreview).not.toHaveBeenCalled();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it.each([
    {
      toolName: PUBLISH_FRONT_COMPONENT_TOOL_NAME,
      decision: 'Reject',
      isAnswered: true,
    },
    {
      toolName: PUBLISH_FRONT_COMPONENT_TOOL_NAME,
      decision: 'Approve',
      isAnswered: false,
    },
    { toolName: 'http_request', decision: 'Approve', isAnswered: true },
  ])(
    'does not refresh for $toolName / $decision / $isAnswered',
    async ({ toolName, decision, isAnswered }) => {
      const user = userEvent.setup();
      let completeAnswer: (answered: boolean) => void = () => {};
      answerAgentChatToolCall.mockReturnValue(
        new Promise<boolean>((resolve) => {
          completeAnswer = resolve;
        }),
      );
      renderCard({
        proposal: {
          ...PROPOSAL,
          toolName,
          arguments: { draftId: 'current', checksum: 'a'.repeat(64) },
        },
      });
      await user.click(screen.getByRole('button', { name: decision }));
      await act(async () => completeAnswer(isAnswered));
      expect(answerAgentChatToolCall).toHaveBeenCalledTimes(1);
      expect(refreshFrontComponents).not.toHaveBeenCalled();
    },
  );
});
