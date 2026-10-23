import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatApprovalOutcome } from '@/ai/components/AiChatApprovalOutcome';
import { AiChatApprovalReviewDeck } from '@/ai/components/AiChatApprovalReviewDeck';
import { AiChatApprovalReviewExample } from '@/ai/components/__stories__/AiChatApprovalReviewExample';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const StyledOutcomes = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const meta = {
  title: 'Modules/AI/AiChatApprovalReviewDeck',
  component: AiChatApprovalReviewExample,
  decorators: [ComponentDecorator, MemoryRouterDecorator, RootDecorator],
  parameters: { container: { width: 728 }, argos: { fitToContent: false } },
  args: { onApprove: fn(), onDeny: fn() },
} satisfies Meta<typeof AiChatApprovalReviewExample>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Create: Story = {};

export const KeyboardFieldFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Select Sundar Pichai' }),
    );
    await userEvent.tab();

    const name = canvas.getByRole('textbox', { name: 'Sundar Pichai People' });
    const label = name.parentElement;

    await expect(name).toHaveFocus();
    await expect(getComputedStyle(name).outlineWidth).toBe('2px');

    if (!isDefined(label)) {
      throw new Error('Editable record label is missing');
    }

    await expect(getComputedStyle(label).overflowX).toBe('visible');
    await expect(getComputedStyle(label).overflowY).toBe('visible');
  },
};

export const Update: Story = {
  args: { initialActiveIndex: 1 },
};

export const Delete: Story = {
  args: { initialActiveIndex: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('table', { name: 'Delete 2 people review' }),
    ).toBeVisible();
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    await expect(canvas.getByText('reid@linkedin.com')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Delete 2' }),
    ).toBeEnabled();
  },
};

export const RetainedEditsAndSelection: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const email = canvas.getByRole('textbox', { name: 'Sundar Pichai Email' });

    await userEvent.clear(email);
    await userEvent.type(email, 'sundar.pichai@google.com');
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Select Thomas Kurian' }),
    );
    await expect(
      canvas.getByRole('button', { name: 'Create 2' }),
    ).toBeEnabled();
    await expect(
      canvas.getByText('2 selected · 1 skipped', { exact: false }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Next approval' }),
    );

    const employees = canvas.getByRole('textbox', { name: 'Stripe Employees' });

    await userEvent.clear(employees);
    await userEvent.type(employees, '9,250');
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Select Airbnb' }),
    );
    await expect(
      canvas.getByRole('button', { name: 'Update 1' }),
    ).toBeEnabled();
    await expect(
      canvas.getByText('1 selected · 1 skipped', { exact: false }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Next approval' }),
    );
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Select Reid Hoffman' }),
    );
    await expect(
      canvas.getByRole('button', { name: 'Delete 1' }),
    ).toBeEnabled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Previous approval' }),
    );

    await expect(
      canvas.getByRole('textbox', { name: 'Stripe Employees' }),
    ).toHaveValue('9,250');
    await expect(
      canvas.getByRole('checkbox', { name: 'Select Airbnb' }),
    ).not.toBeChecked();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Previous approval' }),
    );
    await expect(
      canvas.getByRole('textbox', { name: 'Sundar Pichai Email' }),
    ).toHaveValue('sundar.pichai@google.com');
    await expect(
      canvas.getByRole('checkbox', { name: 'Select Thomas Kurian' }),
    ).not.toBeChecked();

    const editedEmail = canvas.getByRole('textbox', {
      name: 'Sundar Pichai Email',
    });
    const deny = canvas.getByRole('button', { name: 'Deny' });
    const nextApproval = canvas.getByRole('button', { name: 'Next approval' });

    await userEvent.click(
      canvas.getByRole('button', { name: 'Approve all 3' }),
    );

    const dialog = await body.findByRole('alertdialog');

    await expect(
      within(dialog).getByRole('heading', { name: 'Approve 3 actions?' }),
    ).toBeVisible();
    await waitFor(() => {
      expect(dialog.contains(canvasElement.ownerDocument.activeElement)).toBe(
        true,
      );
    });
    await expect(editedEmail).toBeDisabled();
    await expect(deny).toBeDisabled();
    await expect(nextApproval).toBeDisabled();
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    );
    await expect(editedEmail).toHaveValue('sundar.pichai@google.com');
    await expect(deny).toBeEnabled();
    await expect(nextApproval).toBeEnabled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Approve all 3' }),
    );

    const reopenedDialog = within(await body.findByRole('alertdialog'));

    await userEvent.click(
      reopenedDialog.getByRole('button', { name: 'Confirm approval' }),
    );
    await expect(args.onApprove).toHaveBeenCalledWith({
      cards: [
        expect.objectContaining({
          id: 'create-people',
          selectedRecordIds: ['sundar', 'roelof'],
          skippedRecordIds: ['thomas'],
          records: expect.arrayContaining([
            expect.objectContaining({
              id: 'sundar',
              values: expect.objectContaining({
                email: 'sundar.pichai@google.com',
              }),
            }),
          ]),
        }),
        expect.objectContaining({
          id: 'update-companies',
          selectedRecordIds: ['stripe'],
          skippedRecordIds: ['airbnb'],
          records: expect.arrayContaining([
            expect.objectContaining({
              id: 'stripe',
              values: expect.objectContaining({ employees: '9,250' }),
            }),
          ]),
        }),
        expect.objectContaining({
          id: 'delete-people',
          selectedRecordIds: ['stewart'],
          skippedRecordIds: ['reid'],
        }),
      ],
    });
  },
};

export const ApproveAllIncludesUnopenedCards: Story = {
  args: {
    initialSelectedRecordIds: {
      'create-people': ['sundar', 'roelof'],
      'update-companies': ['stripe'],
      'delete-people': ['reid'],
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await expect(
      canvas.queryByRole('table', { name: 'Update 2 companies review' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Create 2' }),
    ).toBeEnabled();
    await expect(
      canvas.getByText('2 selected · 1 skipped', { exact: false }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Approve all 3' }),
    );

    const confirmation = within(await body.findByRole('alertdialog'));

    await expect(
      confirmation.getByRole('heading', { name: 'Approve 3 actions?' }),
    ).toBeVisible();
    await expect(confirmation.getAllByRole('listitem')).toHaveLength(3);
    await expect(confirmation.getByText('Create 3 people')).toBeVisible();
    await expect(confirmation.getByText('Update 2 companies')).toBeVisible();
    await expect(confirmation.getByText('Delete 2 people')).toBeVisible();
    await expect(
      confirmation.getByText('2 selected · 1 skipped'),
    ).toBeVisible();
    await expect(
      confirmation.getAllByText('1 selected · 1 skipped'),
    ).toHaveLength(2);
    await expect(
      confirmation.getByText('4 records selected · 3 records skipped'),
    ).toBeVisible();
    await expect(args.onApprove).not.toHaveBeenCalled();
    await userEvent.click(
      confirmation.getByRole('button', { name: 'Confirm approval' }),
    );
    await expect(args.onApprove).toHaveBeenCalledWith({
      cards: [
        expect.objectContaining({
          id: 'create-people',
          selectedRecordIds: ['sundar', 'roelof'],
          skippedRecordIds: ['thomas'],
        }),
        expect.objectContaining({
          id: 'update-companies',
          selectedRecordIds: ['stripe'],
          skippedRecordIds: ['airbnb'],
        }),
        expect.objectContaining({
          id: 'delete-people',
          selectedRecordIds: ['reid'],
          skippedRecordIds: ['stewart'],
        }),
      ],
    });
  },
};

export const ApproveCurrentCard: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const outcomeStatus = canvas.getByRole('status');

    await expect(outcomeStatus).toBeEmptyDOMElement();

    await userEvent.click(canvas.getByRole('button', { name: 'Create 3' }));

    const confirmation = within(await body.findByRole('alertdialog'));

    await expect(
      confirmation.getByRole('heading', { name: 'Approve 1 action?' }),
    ).toBeVisible();
    await expect(confirmation.getAllByRole('listitem')).toHaveLength(1);
    await expect(confirmation.getByText('Create 3 people')).toBeVisible();
    await userEvent.click(
      confirmation.getByRole('button', { name: 'Confirm approval' }),
    );
    await expect(args.onApprove).toHaveBeenCalledWith({
      cards: [
        expect.objectContaining({
          id: 'create-people',
          selectedRecordIds: ['sundar', 'thomas', 'roelof'],
          skippedRecordIds: [],
        }),
      ],
    });
    await expect(canvas.getAllByText('Succeeded')).toHaveLength(4);
    await expect(canvas.getByRole('status')).toBe(outcomeStatus);
    await expect(outcomeStatus).toHaveTextContent('Succeeded');
    await expect(
      canvas.getByRole('button', { name: 'Create 3' }),
    ).toBeDisabled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Next approval' }),
    );
    await expect(
      canvas.getByRole('button', { name: 'Update 2' }),
    ).toBeEnabled();
    await expect(canvas.getByRole('status')).toBe(outcomeStatus);
    await expect(outcomeStatus).toBeEmptyDOMElement();
    await expect(
      canvas.getByRole('button', { name: 'Approve all 2' }),
    ).toBeEnabled();
    await expect(
      canvas.getByRole('textbox', { name: 'Stripe ARR' }),
    ).toHaveValue('$2,100,000');
    await expect(
      canvas.getByRole('checkbox', { name: 'Select all records' }),
    ).toBeChecked();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Next approval' }),
    );
    await expect(
      canvas.getByRole('button', { name: 'Delete 2' }),
    ).toBeEnabled();
    await expect(args.onDeny).not.toHaveBeenCalled();
  },
};

export const DenyCurrentCard: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Deny' }));
    await expect(args.onDeny).toHaveBeenCalledWith('create-people');
    await expect(args.onApprove).not.toHaveBeenCalled();
    await expect(canvas.getAllByText('Skipped')).toHaveLength(4);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Next approval' }),
    );
    await expect(
      canvas.getByRole('button', { name: 'Update 2' }),
    ).toBeEnabled();
  },
};

export const Running: Story = {
  args: { initialStatus: 'running' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    for (const input of canvas.getAllByRole('textbox')) {
      await expect(input).toBeDisabled();
    }

    for (const checkbox of canvas.getAllByRole('checkbox')) {
      await expect(checkbox).toHaveAttribute('aria-disabled', 'true');
    }

    await expect(canvas.getByRole('button', { name: 'Deny' })).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: 'Create 3' }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole('progressbar', { name: 'Action progress' }),
    ).toHaveAttribute('aria-valuenow', '1');
    await userEvent.click(canvas.getByRole('button', { name: 'Create 3' }));
    await expect(args.onApprove).not.toHaveBeenCalled();
    await expect(args.onDeny).not.toHaveBeenCalled();
  },
};

export const NoSelectedRecords: Story = {
  args: {
    initialSelectedRecordIds: {
      'create-people': [],
      'update-companies': [],
      'delete-people': [],
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const approve = canvas.getByRole('button', { name: 'Create 0' });
    const approveAll = canvas.getByRole('button', { name: 'Approve all 3' });

    await expect(approve).toBeDisabled();
    await expect(approveAll).toBeDisabled();
    await expect(
      canvas.getByText('0 selected · 3 skipped', { exact: false }),
    ).toBeVisible();
    await userEvent.click(approve);
    await userEvent.click(approveAll);
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Select all records' }),
    );
    await expect(
      canvas.getByRole('button', { name: 'Create 3' }),
    ).toBeEnabled();
    for (const checkbox of canvas.getAllByRole('checkbox')) {
      await expect(checkbox).toBeChecked();
    }
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Select all records' }),
    );
    await expect(
      canvas.getByRole('button', { name: 'Create 0' }),
    ).toBeDisabled();
    await expect(args.onApprove).not.toHaveBeenCalled();
    await expect(args.onDeny).not.toHaveBeenCalled();
  },
};

export const RecordOutcomes: Story = {
  args: {
    initialStatus: 'success',
    initialSelectedRecordIds: { 'create-people': ['sundar'] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sundar = within(canvas.getByRole('row', { name: /Sundar Pichai/ }));
    const thomas = within(canvas.getByRole('row', { name: /Thomas Kurian/ }));
    const roelof = within(canvas.getByRole('row', { name: /Roelof Botha/ }));

    await expect(sundar.getByText('Succeeded')).toBeVisible();
    await expect(thomas.getByText('Skipped')).toBeVisible();
    await expect(roelof.getByText('Skipped')).toBeVisible();

    for (const input of canvas.getAllByRole('textbox')) {
      await expect(input).toBeDisabled();
    }

    for (const checkbox of canvas.getAllByRole('checkbox')) {
      await expect(checkbox).toHaveAttribute('aria-disabled', 'true');
    }

    await expect(canvas.getByRole('button', { name: 'Deny' })).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: 'Create 1' }),
    ).toBeDisabled();
  },
};

export const Empty: Story = {
  render: () => (
    <AiChatApprovalReviewDeck
      cards={[]}
      activeIndex={0}
      onActiveIndexChange={fn()}
      onRequestApproval={fn()}
      onDeny={fn()}
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

export const OutcomeStates: Story = {
  render: () => (
    <StyledOutcomes>
      <AiChatApprovalOutcome
        status="pending"
        message="Waiting for your review"
      />
      <AiChatApprovalOutcome
        status="running"
        message="Creating 3 people"
        progress={{ completed: 1, total: 3 }}
      />
      <AiChatApprovalOutcome status="success" message="3 people created" />
      <AiChatApprovalOutcome
        status="failed"
        message="The record was not saved"
      />
      <AiChatApprovalOutcome
        status="blocked"
        message="You need permission to delete these records"
      />
      <AiChatApprovalOutcome
        status="uncertain"
        message="Check the record before trying again"
      />
      <AiChatApprovalOutcome status="skipped" message="No records changed" />
    </StyledOutcomes>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const label of [
      'Pending',
      'Running',
      'Succeeded',
      'Failed',
      'Blocked',
      'Outcome unknown',
      'Skipped',
    ]) {
      await expect(canvas.getByText(label)).toBeVisible();
    }
  },
};

export const NarrowReview: Story = {
  args: { initialActiveIndex: 1 },
  parameters: { container: { width: 360 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scrollRegion = canvas.getByRole('region', {
      name: 'Scrollable record review',
    });

    await expect(scrollRegion.scrollWidth).toBeGreaterThan(
      scrollRegion.clientWidth,
    );
    await expect(
      canvas.getByRole('button', { name: 'Update 2' }),
    ).toBeVisible();
  },
};
