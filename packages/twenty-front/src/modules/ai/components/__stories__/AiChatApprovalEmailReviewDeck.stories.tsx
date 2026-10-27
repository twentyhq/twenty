import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatApprovalEmailControlledExample } from '@/ai/components/__stories__/AiChatApprovalEmailControlledExample';
import { AiChatApprovalEmailReviewExample } from '@/ai/components/__stories__/AiChatApprovalEmailReviewExample';
import { AI_CHAT_APPROVAL_EMAIL_REVIEW_FIXTURES } from '@/ai/components/__stories__/aiChatApprovalEmailReviewFixtures';
import { type AiChatApprovalReviewEmail } from '@/ai/types/AiChatApprovalReviewEmail';
import { type AiChatApprovalReviewStatus } from '@/ai/types/AiChatApprovalReviewStatus';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const EMAIL_REVIEW_STATUSES: readonly AiChatApprovalReviewStatus[] = [
  'pending',
  'running',
  'success',
  'failed',
  'blocked',
  'uncertain',
  'skipped',
];

const EMAIL_REVIEW_STATUS_LABELS = {
  pending: 'Pending',
  running: 'Running',
  success: 'Succeeded',
  failed: 'Failed',
  blocked: 'Blocked',
  uncertain: 'Outcome unknown',
  skipped: 'Skipped',
};

const getBodyEditor = (canvasElement: HTMLElement) =>
  within(canvasElement).findByRole('textbox', { name: 'Body' });

const meta = {
  title: 'Modules/AI/AiChatApprovalEmailReviewDeck',
  component: AiChatApprovalEmailReviewExample,
  decorators: [ComponentDecorator, MemoryRouterDecorator, RootDecorator],
  parameters: { container: { width: 688 }, argos: { fitToContent: false } },
  args: { onApprove: fn(), onSkip: fn() },
} satisfies Meta<typeof AiChatApprovalEmailReviewExample>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RetainedDraftEdits: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);
    const subject = canvas.getByRole('textbox', { name: 'Subject' });

    await userEvent.clear(subject);
    await userEvent.type(subject, 'Revised demo follow-up');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove joe@example.com' }),
    );
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Add a recipient to To' }),
      'joe.revised@example.com{Enter}',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Cc/Bcc' }));
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Add a recipient to Cc' }),
      'team@example.com{Enter}',
    );

    const bodyEditor = await getBodyEditor(canvasElement);

    await userEvent.clear(bodyEditor);
    await userEvent.type(bodyEditor, 'Updated walkthrough for Brian and Joe.');
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Add a recipient to Bcc' }),
      'archive@example.com',
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Next approval' }),
    );

    const secondSubject = canvas.getByRole('textbox', { name: 'Subject' });

    await userEvent.clear(secondSubject);
    await userEvent.type(secondSubject, 'Revised reporting walkthrough');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Previous approval' }),
    );

    await expect(canvas.getByRole('textbox', { name: 'Subject' })).toHaveValue(
      'Revised demo follow-up',
    );
    await expect(canvas.getByText('joe.revised@example.com')).toBeVisible();
    await expect(canvas.getByText('team@example.com')).toBeVisible();
    await expect(canvas.getByText('archive@example.com')).toBeVisible();
    await expect(canvas.queryByText('Joe Gebbia')).not.toBeInTheDocument();
    await expect(await getBodyEditor(canvasElement)).toHaveTextContent(
      'Updated walkthrough for Brian and Joe.',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Send all 3' }));

    const confirmation = await screen.findByRole('alertdialog');

    await expect(
      within(confirmation).getByText('3 emails selected · 0 emails skipped'),
    ).toBeVisible();
    await expect(
      within(confirmation).getByText('Checking in before the rollout'),
    ).toBeVisible();
    await expect(args.onApprove).not.toHaveBeenCalled();
    await userEvent.click(
      within(confirmation).getByRole('button', { name: 'Cancel' }),
    );
    await expect(canvas.getByRole('textbox', { name: 'Subject' })).toHaveValue(
      'Revised demo follow-up',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Send all 3' }));
    await userEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Confirm approval',
      }),
    );

    await expect(args.onApprove).toHaveBeenCalledTimes(1);
    await expect(args.onApprove).toHaveBeenCalledWith({
      emails: [
        expect.objectContaining({
          id: 'demo-follow-up',
          draft: expect.objectContaining({
            subject: 'Revised demo follow-up',
            to: [
              { address: 'brian@example.com', displayName: 'Brian Chesky' },
              { address: 'joe.revised@example.com' },
            ],
            cc: [{ address: 'team@example.com' }],
            bcc: [{ address: 'archive@example.com' }],
            body: expect.stringContaining(
              'Updated walkthrough for Brian and Joe.',
            ),
            isCcBccExpanded: true,
          }),
        }),
        expect.objectContaining({
          id: 'reporting-walkthrough',
          draft: expect.objectContaining({
            subject: 'Revised reporting walkthrough',
          }),
        }),
        expect.objectContaining({ id: 'rollout-check-in' }),
      ],
    });
  },
};

export const IndividualApproval: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Send' }));

    const confirmation = await screen.findByRole('alertdialog');

    await expect(
      within(confirmation).getByText('1 email selected · 0 emails skipped'),
    ).toBeVisible();
    await expect(args.onApprove).not.toHaveBeenCalled();
    await userEvent.click(
      within(confirmation).getByRole('button', { name: 'Confirm approval' }),
    );
    await expect(args.onApprove).toHaveBeenCalledWith({
      emails: [AI_CHAT_APPROVAL_EMAIL_REVIEW_FIXTURES[0]],
    });
    await expect(canvas.getByText('Succeeded')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeDisabled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Next approval' }),
    );
    await expect(canvas.getByRole('textbox', { name: 'Subject' })).toHaveValue(
      'Pipeline reporting walkthrough',
    );
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: 'Skip' })).toBeEnabled();
    await expect(args.onSkip).not.toHaveBeenCalled();
    await expect(
      canvas.getByRole('button', { name: 'Send all 2' }),
    ).toBeEnabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Send all 2' }));
    await userEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Confirm approval',
      }),
    );
    await expect(args.onApprove).toHaveBeenLastCalledWith({
      emails: AI_CHAT_APPROVAL_EMAIL_REVIEW_FIXTURES.slice(1),
    });
    await expect(args.onApprove).toHaveBeenCalledTimes(2);
  },
};

export const SkipIsolation: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Skip' }));
    await expect(args.onSkip).toHaveBeenCalledWith('demo-follow-up');
    await expect(canvas.getByText('Skipped')).toBeVisible();
    await expect(args.onApprove).not.toHaveBeenCalled();
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeDisabled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Next approval' }),
    );
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeEnabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Send all 2' }));
    await userEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Confirm approval',
      }),
    );
    await expect(args.onApprove).toHaveBeenCalledWith({
      emails: AI_CHAT_APPROVAL_EMAIL_REVIEW_FIXTURES.slice(1),
    });
    await userEvent.click(
      canvas.getByRole('button', { name: 'Previous approval' }),
    );
    await expect(canvas.getByText('Skipped')).toBeVisible();
  },
};

export const Outcomes: Story = {
  args: {
    initialEmails: EMAIL_REVIEW_STATUSES.map<AiChatApprovalReviewEmail>(
      (status) => ({
        ...AI_CHAT_APPROVAL_EMAIL_REVIEW_FIXTURES[0],
        id: `email-${status}`,
        status,
        outcomeMessage: `Fixture outcome: ${status}.`,
        progress: status === 'running' ? { completed: 0, total: 1 } : undefined,
      }),
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const status of EMAIL_REVIEW_STATUSES) {
      const editor = await getBodyEditor(canvasElement);
      const isPending = status === 'pending';

      await waitFor(() =>
        expect(editor).toHaveAttribute(
          'contenteditable',
          isPending ? 'true' : 'false',
        ),
      );

      if (isPending) {
        await expect(
          canvas.getByRole('button', { name: 'Send' }),
        ).toBeEnabled();
      }

      if (!isPending) {
        await expect(
          canvas.getByText(EMAIL_REVIEW_STATUS_LABELS[status]),
        ).toBeVisible();
        await expect(
          canvas.getByRole('textbox', { name: 'Subject' }),
        ).toBeDisabled();
        await expect(
          canvas.getByRole('button', { name: 'Send' }),
        ).toBeDisabled();
        await expect(
          canvas.getByRole('button', { name: 'Skip' }),
        ).toBeDisabled();
        await expect(
          canvas.queryByRole('textbox', { name: 'Add a recipient to To' }),
        ).not.toBeInTheDocument();
        await expect(
          canvas.queryByRole('button', { name: 'Remove brian@example.com' }),
        ).not.toBeInTheDocument();
      }

      if (status === 'running') {
        await expect(
          canvas.getByRole('progressbar', { name: 'Action progress' }),
        ).toHaveAttribute('aria-valuenow', '0');
      }

      if (status !== 'skipped') {
        await userEvent.click(
          canvas.getByRole('button', { name: 'Next approval' }),
        );
      }
    }
  },
};

export const MissingRecipient: Story = {
  args: {
    initialEmails: AI_CHAT_APPROVAL_EMAIL_REVIEW_FIXTURES.map((email) =>
      email.id === 'demo-follow-up'
        ? { ...email, draft: { ...email.draft, to: [] } }
        : email,
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Send' })).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: 'Send all 3' }),
    ).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Skip' })).toBeEnabled();
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Add a recipient to To' }),
      'brian@example.com{Enter}',
    );
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeEnabled();
    await expect(
      canvas.getByRole('button', { name: 'Send all 3' }),
    ).toBeEnabled();
  },
};

export const Empty: Story = {
  args: { initialEmails: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('No actions to review')).toBeVisible();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const Single: Story = {
  args: { initialEmails: AI_CHAT_APPROVAL_EMAIL_REVIEW_FIXTURES.slice(0, 1) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByRole('button', { name: 'Next approval' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Previous approval' }),
    ).not.toBeInTheDocument();
    await expect(canvas.queryByText(/Send all/)).not.toBeInTheDocument();
    await expect(
      canvas.getByText('No more drafts after this one'),
    ).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeEnabled();
  },
};

export const Narrow: Story = {
  parameters: { container: { width: 320 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const review = canvas.getByRole('region', { name: 'Approval review' });

    await expect(await getBodyEditor(canvasElement)).toBeVisible();
    await expect(review.scrollWidth).toBeLessThanOrEqual(review.clientWidth);
    await userEvent.click(canvas.getByRole('button', { name: 'Cc/Bcc' }));
    await expect(
      canvas.getByRole('textbox', { name: 'Add a recipient to Bcc' }),
    ).toBeVisible();
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
