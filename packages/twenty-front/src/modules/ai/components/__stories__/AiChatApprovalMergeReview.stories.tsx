import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatApprovalMergeReview } from '@/ai/components/AiChatApprovalMergeReview';
import { AiChatApprovalMergeReviewExample } from '@/ai/components/__stories__/AiChatApprovalMergeReviewExample';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const meta = {
  title: 'Modules/AI/AiChatApprovalMergeReview',
  component: AiChatApprovalMergeReviewExample,
  decorators: [ComponentDecorator, MemoryRouterDecorator, RootDecorator],
  parameters: { container: { width: 728 }, argos: { fitToContent: false } },
  args: { onMerge: fn(), onSkip: fn() },
} satisfies Meta<typeof AiChatApprovalMergeReviewExample>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Pending: Story = {};

export const SourceRecords: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sources = within(
      canvas.getByRole('group', { name: 'Source records' }),
    );

    await expect(sources.getByText('First: Google')).toBeVisible();
    await expect(sources.getByText('Second: Google Inc.')).toBeVisible();
    await expect(canvas.getByText('Survives')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Previous pair' }),
    ).toBeDisabled();
    await userEvent.click(canvas.getByRole('tab', { name: 'First' }));

    const firstSource = within(canvas.getByRole('tabpanel'));

    await expect(
      firstSource.getByRole('link', { name: 'google.com' }),
    ).toBeVisible();
    await expect(firstSource.getByText('Tim Apple')).toBeVisible();
    await userEvent.click(canvas.getByRole('tab', { name: 'Second' }));

    const secondSource = within(canvas.getByRole('tabpanel'));

    await expect(
      canvas.getByText('Google Inc.', { exact: true }),
    ).toBeVisible();
    await expect(canvas.getByText('Survives')).toBeVisible();
    await expect(
      secondSource.getByRole('link', { name: 'about.google' }),
    ).toBeVisible();
    await expect(secondSource.getByText('Sundar Pichai')).toBeVisible();
    await expect(
      secondSource.queryByText('1600 Amphitheatre Pkwy'),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('tab', { name: 'Merge preview' }));
    await expect(canvas.getByText('Google', { exact: true })).toBeVisible();
    await expect(canvas.getByText('Survives')).toBeVisible();
    await expect(
      within(canvas.getByRole('tabpanel')).getByText('1600 Amphitheatre Pkwy'),
    ).toBeVisible();
  },
};

export const RetainedChoicesAndSingleMerge: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('tab', { name: 'Settings' }));
    await userEvent.click(
      canvas.getByRole('button', { name: 'First record holds priority' }),
    );
    await userEvent.click(
      await body.findByRole('option', { name: 'Second record holds priority' }),
    );
    await expect(
      canvas.getByRole('button', { name: 'Second record holds priority' }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Next pair' }));
    await expect(
      canvas.getByRole('tab', { name: 'Merge preview' }),
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(canvas.getByRole('tab', { name: 'First' }));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Previous pair' }),
    );
    await expect(canvas.getByRole('tab', { name: 'Settings' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(
      canvas.getByRole('button', { name: 'Second record holds priority' }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('tab', { name: 'Merge preview' }));
    await expect(
      canvas.getByText('Google Inc.', { exact: true }),
    ).toBeVisible();
    await expect(canvas.getByText('Survives')).toBeVisible();
    await expect(
      within(canvas.getByRole('tabpanel')).getByRole('link', {
        name: 'about.google',
      }),
    ).toBeVisible();
    await expect(
      within(canvas.getByRole('tabpanel')).getByText('1600 Amphitheatre Pkwy'),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Next pair' }));
    await expect(canvas.getByRole('tab', { name: 'First' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Previous pair' }),
    );
    await expect(
      canvas.getByRole('tab', { name: 'Merge preview' }),
    ).toHaveAttribute('aria-selected', 'true');
    const nextPair = canvas.getByRole('button', { name: 'Next pair' });
    const skip = canvas.getByRole('button', { name: 'Skip' });

    await userEvent.click(canvas.getByRole('button', { name: 'Merge' }));

    const dialog = await body.findByRole('alertdialog');
    const confirmation = within(dialog);

    await expect(
      confirmation.getByRole('heading', { name: 'Approve 1 action?' }),
    ).toBeVisible();
    await expect(
      confirmation.getByText('2 records selected · 0 records skipped'),
    ).toBeVisible();
    await expect(
      confirmation.getByText('Merge Google and Google Inc.'),
    ).toBeVisible();
    await expect(nextPair).toBeDisabled();
    await expect(skip).toBeDisabled();
    await expect(args.onMerge).not.toHaveBeenCalled();
    await userEvent.click(confirmation.getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(body.queryByRole('alertdialog')).not.toBeInTheDocument(),
    );
    await expect(
      canvas.getByText('Google Inc.', { exact: true }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Merge' }));
    await userEvent.click(
      within(await body.findByRole('alertdialog')).getByRole('button', {
        name: 'Confirm approval',
      }),
    );
    await expect(args.onMerge).toHaveBeenCalledWith({
      pairs: [
        {
          pairId: 'merge-google',
          priorityRecordId: 'google-inc',
          sourceRecordIds: ['google', 'google-inc'],
        },
      ],
    });
    await waitFor(() =>
      expect(body.queryByRole('alertdialog')).not.toBeInTheDocument(),
    );
    await expect(canvas.getByText('Succeeded')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Merge' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Next pair' }));
    await expect(canvas.getByRole('button', { name: 'Merge' })).toBeEnabled();
    await expect(canvas.getByRole('tab', { name: 'First' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(args.onSkip).not.toHaveBeenCalled();
  },
};

export const SkipCurrentPair: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Skip' }));
    await expect(args.onSkip).toHaveBeenCalledWith('merge-google');
    await expect(args.onMerge).not.toHaveBeenCalled();
    await expect(canvas.getByText('Skipped')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Merge' })).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: 'Merge all 3' }),
    ).toBeEnabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Next pair' }));
    await expect(canvas.getByText('Stripe', { exact: true })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Merge' })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: 'Skip' })).toBeEnabled();
  },
};

export const MergeAllPendingPairs: Story = {
  args: {
    initialStatuses: { 'merge-airbnb': 'blocked', 'merge-linear': 'success' },
    initialPriorityRecordIds: { 'merge-stripe': 'stripe-inc' },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('tab', { name: 'Settings' }));
    await userEvent.click(
      canvas.getByRole('button', { name: 'First record holds priority' }),
    );
    await userEvent.click(
      await body.findByRole('option', { name: 'Second record holds priority' }),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Merge all 2' }));

    const confirmation = within(await body.findByRole('alertdialog'));

    await expect(
      confirmation.getByRole('heading', { name: 'Approve 2 actions?' }),
    ).toBeVisible();
    await expect(confirmation.getAllByRole('listitem')).toHaveLength(2);
    await expect(
      confirmation.getByText('Merge Google and Google Inc.'),
    ).toBeVisible();
    await expect(
      confirmation.getByText('Merge Stripe and Stripe Inc.'),
    ).toBeVisible();
    await expect(
      confirmation.getByText('4 records selected · 0 records skipped'),
    ).toBeVisible();
    await expect(args.onMerge).not.toHaveBeenCalled();
    await userEvent.click(
      confirmation.getByRole('button', { name: 'Confirm approval' }),
    );
    await expect(args.onMerge).toHaveBeenCalledWith({
      pairs: [
        {
          pairId: 'merge-google',
          priorityRecordId: 'google-inc',
          sourceRecordIds: ['google', 'google-inc'],
        },
        {
          pairId: 'merge-stripe',
          priorityRecordId: 'stripe-inc',
          sourceRecordIds: ['stripe', 'stripe-inc'],
        },
      ],
    });
    await expect(
      canvas.queryByRole('button', { name: /Merge all/ }),
    ).not.toBeInTheDocument();
  },
};

export const KeyboardTabs: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const previewTab = canvas.getByRole('tab', { name: 'Merge preview' });

    await userEvent.click(previewTab);
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'First' })).toHaveFocus();
    await expect(canvas.getByRole('tab', { name: 'First' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('tab', { name: 'First' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('tab', { name: 'Settings' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('tab', { name: 'Settings' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

export const InvalidPriorityRequiresSource: Story = {
  args: {
    initialPriorityRecordIds: { 'merge-google': 'synthetic-preview-id' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await expect(
      canvas.getByText('Choose a source record to keep'),
    ).toBeVisible();
    await expect(canvas.queryByText('Survives')).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Merge' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Skip' })).toBeEnabled();
    await expect(
      canvas.getByRole('button', { name: 'Merge all 4' }),
    ).toBeDisabled();
    await userEvent.click(canvas.getByRole('tab', { name: 'Settings' }));
    await userEvent.click(
      canvas.getByRole('button', { name: 'No record holds priority' }),
    );
    await userEvent.click(
      await body.findByRole('option', { name: 'First record holds priority' }),
    );
    await expect(canvas.getByRole('button', { name: 'Merge' })).toBeEnabled();
    await expect(
      canvas.getByRole('button', { name: 'Merge all 4' }),
    ).toBeEnabled();
    await expect(canvas.getByText('Google', { exact: true })).toBeVisible();
    await expect(canvas.getByText('Survives')).toBeVisible();
    await expect(
      canvas.queryByText('Choose a source record to keep'),
    ).not.toBeInTheDocument();
  },
};

export const Running: Story = {
  args: { initialStatus: 'running', initialActiveTab: 'settings' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Skip' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Merge' })).toBeDisabled();
    await expect(canvas.getByText('First record holds priority')).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: /record holds priority/ }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('progressbar', { name: 'Action progress' }),
    ).toHaveAttribute('aria-valuenow', '1');
  },
};

export const Success: Story = { args: { initialStatus: 'success' } };
export const Failed: Story = { args: { initialStatus: 'failed' } };
export const Blocked: Story = { args: { initialStatus: 'blocked' } };
export const Uncertain: Story = { args: { initialStatus: 'uncertain' } };
export const Skipped: Story = { args: { initialStatus: 'skipped' } };

export const MixedOutcomes: Story = {
  args: {
    initialStatuses: {
      'merge-google': 'success',
      'merge-stripe': 'failed',
      'merge-airbnb': 'blocked',
      'merge-linear': 'uncertain',
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    for (const label of ['Succeeded', 'Failed', 'Blocked', 'Outcome unknown']) {
      await expect(canvas.getByText(label)).toBeVisible();
      await expect(
        canvas.getByRole('button', { name: 'Merge' }),
      ).toBeDisabled();
      await expect(canvas.getByRole('button', { name: 'Skip' })).toBeDisabled();

      if (label !== 'Outcome unknown') {
        await userEvent.click(
          canvas.getByRole('button', { name: 'Next pair' }),
        );
      }
    }

    await expect(
      canvas.getByRole('button', { name: 'Next pair' }),
    ).toBeDisabled();
    await expect(args.onMerge).not.toHaveBeenCalled();
    await expect(args.onSkip).not.toHaveBeenCalled();
  },
};

export const Narrow: Story = {
  parameters: { container: { width: 360 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole('group', { name: 'Merge 2 companies' });

    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
    await expect(canvas.getByRole('button', { name: 'Merge' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Skip' })).toBeVisible();
    await userEvent.click(canvas.getByRole('tab', { name: 'Settings' }));
    await expect(
      canvas.getByRole('button', { name: 'First record holds priority' }),
    ).toBeVisible();
  },
};

export const Empty: Story = {
  render: () => (
    <AiChatApprovalMergeReview
      pairs={[]}
      activeIndex={0}
      onActiveIndexChange={fn()}
      onTabChange={fn()}
      onPriorityRecordChange={fn()}
      onRequestMerge={fn()}
      onSkip={fn()}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('status')).toHaveTextContent(
      'No actions to review',
    );
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};
