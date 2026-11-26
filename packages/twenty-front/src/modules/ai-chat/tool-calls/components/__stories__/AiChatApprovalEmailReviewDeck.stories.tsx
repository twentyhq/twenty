import { type Meta, type StoryObj } from '@storybook/react-vite';
import { delay, graphql, HttpResponse } from 'msw';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatApprovalEmailReviewDeck } from '@/ai-chat/tool-calls/components/AiChatApprovalEmailReviewDeck';
import { AiChatApprovalEmailControlledExample } from '@/ai-chat/tool-calls/components/__stories__/AiChatApprovalEmailControlledExample';
import { AI_CHAT_APPROVAL_EMAIL_REVIEW_FIXTURES } from '@/ai-chat/tool-calls/components/__stories__/aiChatApprovalEmailReviewFixtures';
import { type AiChatPendingEmailApproval } from '@/ai-chat/tool-calls/types/AiChatPendingEmailApproval';
import { AiChatInstanceDecorator } from '~/testing/decorators/AiChatInstanceDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const THREAD_ID = 'email-approval-review-story';

const answerToolCall = fn();

const buildAnswerToolCallHandlers = ({
  isPending = false,
}: { isPending?: boolean } = {}) => [
  graphql.mutation('AnswerToolCall', async ({ variables }) => {
    answerToolCall(variables.input);

    if (isPending) {
      await delay('infinite');
    }

    return HttpResponse.json({
      data: {
        answerToolCall: { __typename: 'AnswerToolCallResult', streamId: null },
      },
    });
  }),
  ...graphqlMocks.handlers,
];

const getBodyEditor = (canvasElement: HTMLElement) =>
  within(canvasElement).findByRole('textbox', { name: 'Body' });

type EmailReviewDeckProps = {
  emailApprovals: AiChatPendingEmailApproval[];
};

const EmailReviewDeck = ({ emailApprovals }: EmailReviewDeckProps) => {
  const [answeringToolCallIds, setAnsweringToolCallIds] = useState<string[]>(
    [],
  );

  return (
    <AiChatApprovalEmailReviewDeck
      emailApprovals={emailApprovals}
      answeringToolCallIds={answeringToolCallIds}
      onAnsweringToolCallIdsChange={setAnsweringToolCallIds}
    />
  );
};

const meta = {
  title: 'Modules/AI/AiChatApprovalEmailReviewDeck',
  component: EmailReviewDeck,
  decorators: [
    AiChatInstanceDecorator,
    RootDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
    ComponentDecorator,
  ],
  parameters: {
    aiChatThreadId: THREAD_ID,
    container: { width: 704 },
    argos: { fitToContent: false },
    msw: { handlers: buildAnswerToolCallHandlers() },
  },
  args: { emailApprovals: AI_CHAT_APPROVAL_EMAIL_REVIEW_FIXTURES },
  beforeEach: () => {
    answerToolCall.mockClear();
  },
} satisfies Meta<typeof EmailReviewDeck>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FirstOfFive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('1/5')).toBeVisible();
    await expect(
      canvas.getByText('4 more drafts after this one'),
    ).toBeVisible();
    await expect(canvas.getByText('Brian Chesky')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Send all 5' }),
    ).toBeEnabled();
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeEnabled();
  },
};

export const LastDraft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nextDraftButton = await canvas.findByRole('button', {
      name: 'Next draft',
    });

    for (let draftIndex = 0; draftIndex < 4; draftIndex++) {
      await userEvent.click(nextDraftButton);
    }

    await expect(canvas.getByText('5/5')).toBeVisible();
    await expect(
      canvas.getByText('No more drafts after this one'),
    ).toBeVisible();
    await expect(canvas.getByRole('textbox', { name: 'Subject' })).toHaveValue(
      'Renewal coming up next month',
    );
  },
};

export const SingleDraft: Story = {
  args: { emailApprovals: AI_CHAT_APPROVAL_EMAIL_REVIEW_FIXTURES.slice(0, 1) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText('No more drafts after this one'),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Next draft' }),
    ).not.toBeInTheDocument();
    await expect(canvas.queryByText(/Send all/)).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeEnabled();
  },
};

export const Sending: Story = {
  parameters: {
    msw: { handlers: buildAnswerToolCallHandlers({ isPending: true }) },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(canvas.getByRole('textbox', { name: 'Subject' })).toBeDisabled(),
    );
    await expect(canvas.getByRole('button', { name: 'Skip' })).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: 'Send all 4' }),
    ).toBeDisabled();
  },
};

export const Sent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('button', { name: 'Send' }));

    await expect(await canvas.findByText('2/5')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Send all 4' }),
    ).toBeEnabled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Previous draft' }),
    );
    await expect(await canvas.findByText('Email sent')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeDisabled();
    await expect(answerToolCall).toHaveBeenCalledWith(
      expect.objectContaining({
        toolCallId: 'demo-follow-up',
        response: expect.objectContaining({
          decision: 'approve',
          toolName: 'send_email',
        }),
      }),
    );
  },
};

export const EditedDraftIsSent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const subject = await canvas.findByRole('textbox', { name: 'Subject' });

    await userEvent.clear(subject);
    await userEvent.type(subject, 'Revised demo follow-up');
    await userEvent.click(canvas.getByRole('button', { name: 'Next draft' }));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Previous draft' }),
    );
    await expect(canvas.getByRole('textbox', { name: 'Subject' })).toHaveValue(
      'Revised demo follow-up',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(answerToolCall).toHaveBeenCalledWith(
        expect.objectContaining({
          toolCallId: 'demo-follow-up',
          response: expect.objectContaining({
            arguments: expect.objectContaining({
              subject: 'Revised demo follow-up',
              recipients: {
                to: 'brian@example.com, joe@example.com',
                cc: '',
                bcc: '',
              },
            }),
          }),
        }),
      ),
    );
  },
};

export const SendAll: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Send all 5' }),
    );

    await waitFor(() => expect(answerToolCall).toHaveBeenCalledTimes(5));
    await expect(await canvas.findByText('Email sent')).toBeVisible();
    await expect(canvas.queryByText(/Send all/)).not.toBeInTheDocument();
  },
};

export const SkippedDraft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('button', { name: 'Skip' }));

    await expect(await canvas.findByText('2/5')).toBeVisible();
    await expect(answerToolCall).toHaveBeenCalledWith(
      expect.objectContaining({
        toolCallId: 'demo-follow-up',
        response: { decision: 'reject' },
      }),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Delete draft' }));
    await expect(await canvas.findByText('3/5')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Send all 3' }),
    ).toBeEnabled();
  },
};

export const MissingRecipient: Story = {
  args: {
    emailApprovals: AI_CHAT_APPROVAL_EMAIL_REVIEW_FIXTURES.map(
      (emailApproval, index) =>
        index === 0
          ? {
              ...emailApproval,
              proposal: {
                ...emailApproval.proposal,
                arguments: {
                  ...emailApproval.proposal.arguments,
                  recipients: { to: '', cc: '', bcc: '' },
                },
              },
            }
          : emailApproval,
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('button', { name: 'Send' }),
    ).toBeDisabled();
    await expect(
      canvas.getByText('Add a recipient before sending'),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Send all 5' }),
    ).toBeDisabled();
    await userEvent.type(
      canvas.getByRole('combobox', { name: 'To' }),
      'brian@example.com{Enter}',
    );
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeEnabled();
  },
};

export const Narrow: Story = {
  parameters: { container: { width: 320 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const review = await canvas.findByRole('region', {
      name: 'Approval review',
    });

    await expect(await getBodyEditor(canvasElement)).toBeVisible();
    await expect(review.scrollWidth).toBeLessThanOrEqual(review.clientWidth);
  },
};

export const ControlledBodyAndReadOnly: Story = {
  render: () => <AiChatApprovalEmailControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = await getBodyEditor(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Replace draft' }),
    );
    await waitFor(() =>
      expect(editor).toHaveTextContent(
        'This replacement comes from the caller.',
      ),
    );
    await expect(canvas.getByRole('textbox', { name: 'Subject' })).toHaveValue(
      'Replacement from the caller',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Lock review' }));
    await waitFor(() =>
      expect(editor).toHaveAttribute('contenteditable', 'false'),
    );
    await expect(
      canvas.getByRole('textbox', { name: 'Subject' }),
    ).toBeDisabled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Unlock review' }),
    );
    await waitFor(() =>
      expect(editor).toHaveAttribute('contenteditable', 'true'),
    );
    await userEvent.type(editor, ' Editable again.');
    await userEvent.keyboard('{ArrowLeft}XY');
    await expect(editor).toHaveTextContent('Editable againXY.');
  },
};
