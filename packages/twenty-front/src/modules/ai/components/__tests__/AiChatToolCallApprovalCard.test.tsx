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
import { type ProposedToolCall } from 'twenty-shared/ai';

import { AiChatToolCallApprovalCard } from '@/ai/components/AiChatToolCallApprovalCard';

type RecordFieldsStubProps = {
  values: Record<string, unknown>;
  onChange: (fieldName: string, value: unknown) => void;
};

const answerAgentChatToolCall = jest.fn();
const refreshFrontComponents = jest.fn();
jest.mock('@/ai/hooks/useRefreshFrontComponents', () => ({
  useRefreshFrontComponents: () => ({
    refreshFrontComponents,
  }),
}));
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

jest.mock('@/ai/components/AiChatFrontComponentPreview', () => ({
  AiChatFrontComponentPreview: ({
    onReadyChange,
  }: {
    onReadyChange: (isReady: boolean) => void;
  }) => (
    <button
      onClick={() => {
        onReadyChange(true);
      }}
    >
      Finish rendering preview
    </button>
  ),
}));

const PROPOSAL: ProposedToolCall = {
  toolName: 'http_request',
  toolLabel: 'HTTP request',
  summary: 'Notify the billing system of the renewal',
  arguments: { url: 'https://billing.example.com', method: 'POST' },
  template: 'generic',
};

const renderCard = (proposal: ProposedToolCall = PROPOSAL) =>
  render(
    <I18nProvider i18n={i18n}>
      <Provider store={createStore()}>
        <AiChatToolCallApprovalCard toolCallId="call-1" proposal={proposal} />
      </Provider>
    </I18nProvider>,
  );

describe('AiChatToolCallApprovalCard', () => {
  beforeEach(() => {
    answerAgentChatToolCall.mockReset();
    refreshFrontComponents.mockReset();
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
      toolName: 'create_one_person',
      toolLabel: 'Create person',
      summary: 'Add the new contact',
      arguments: { name: { firstName: 'Ada', lastName: 'Lovelace' } },
      template: 'recordCreate',
      objectNameSingular: 'person',
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
});

it('requires a rendered component preview before saving the immutable draft', async () => {
  const user = userEvent.setup();
  let completeApproval: (answered: boolean) => void = () => {};
  refreshFrontComponents.mockReset();
  answerAgentChatToolCall.mockReturnValue(
    new Promise<boolean>((resolve) => {
      completeApproval = resolve;
    }),
  );
  renderCard({
    toolName: 'publish_front_component',
    toolLabel: 'Save component',
    summary: 'Save Renewals to Workspace app',
    template: 'frontComponent',
    arguments: { draftId: 'approved-draft' },
  });

  expect(
    screen.getByRole('button', { name: 'Save to Workspace app' }),
  ).toBeDisabled();
  expect(
    screen.queryByRole('textbox', { name: 'Arguments' }),
  ).not.toBeInTheDocument();
  await user.click(
    screen.getByRole('button', { name: 'Finish rendering preview' }),
  );
  await user.click(
    screen.getByRole('button', { name: 'Save to Workspace app' }),
  );

  expect(answerAgentChatToolCall).toHaveBeenCalledWith({
    toolCallId: 'call-1',
    response: { decision: 'approve', arguments: { draftId: 'approved-draft' } },
    optimisticToolOutput: undefined,
  });
  expect(refreshFrontComponents).not.toHaveBeenCalled();
  await act(async () => completeApproval(true));
  await waitFor(() => expect(refreshFrontComponents).toHaveBeenCalledWith());
});

it('shows an immutable deletion target and refreshes pickers only after approval', async () => {
  const user = userEvent.setup();
  let completeApproval: (answered: boolean) => void = () => {};
  refreshFrontComponents.mockReset();
  answerAgentChatToolCall.mockReset().mockReturnValue(
    new Promise<boolean>((resolve) => {
      completeApproval = resolve;
    }),
  );
  renderCard({
    toolName: 'delete_front_component',
    toolLabel: 'Delete Front Component',
    summary: 'Delete Renewals from Workspace app',
    template: 'frontComponentDelete',
    arguments: { frontComponentId: 'approved-component', name: 'Renewals' },
  });
  expect(screen.getByText('Renewals')).toBeInTheDocument();
  expect(screen.getByText('approved-component')).toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Finish rendering preview' }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Delete component' }));
  expect(answerAgentChatToolCall).toHaveBeenCalledWith({
    toolCallId: 'call-1',
    response: {
      decision: 'approve',
      arguments: { frontComponentId: 'approved-component', name: 'Renewals' },
    },
    optimisticToolOutput: undefined,
  });
  expect(refreshFrontComponents).not.toHaveBeenCalled();
  await act(async () => completeApproval(true));
  await waitFor(() => expect(refreshFrontComponents).toHaveBeenCalledWith());
});
