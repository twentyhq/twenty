import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { RecordSharingInvitation } from '@/object-record/record-sharing/components/RecordSharingInvitation';
import { type RecordSharingInvitationRecipient } from '@/object-record/record-sharing/types/RecordSharingInvitationRecipient';
import { RecordShareAccessLevel } from '~/generated-metadata/graphql';

const RECIPIENTS: RecordSharingInvitationRecipient[] = [
  { kind: 'workspaceMember', id: 'sarah', label: 'Sarah Lin' },
  { kind: 'workspaceMember', id: 'marco', label: 'Marco Rossi' },
  { kind: 'role', id: 'sales', label: 'Sales' },
  { kind: 'everyone', id: 'workspace', label: 'Everyone at Acme' },
];

const InvitationStory = ({
  recipients,
  selectedRecipients: initialRecipients,
  accessLevel: initialAccessLevel,
  canInvite,
  isSubmitting,
  errorMessage,
  onRecipientsChange,
  onAccessLevelChange,
  onInvite,
  onCancel,
}: ComponentProps<typeof RecordSharingInvitation>) => {
  const [selectedRecipients, setSelectedRecipients] =
    useState(initialRecipients);
  const [accessLevel, setAccessLevel] = useState(initialAccessLevel);

  return (
    <RecordSharingInvitation
      recipients={recipients}
      selectedRecipients={selectedRecipients}
      accessLevel={accessLevel}
      canInvite={canInvite}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      onRecipientsChange={(nextRecipients) => {
        setSelectedRecipients(nextRecipients);
        onRecipientsChange(nextRecipients);
      }}
      onAccessLevelChange={(nextAccessLevel) => {
        setAccessLevel(nextAccessLevel);
        onAccessLevelChange(nextAccessLevel);
      }}
      onInvite={onInvite}
      onCancel={() => {
        setSelectedRecipients([]);
        onCancel();
      }}
    />
  );
};

const meta = {
  title: 'Modules/ObjectRecord/RecordSharing/RecordSharingInvitation',
  component: RecordSharingInvitation,
  render: InvitationStory,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 400 } },
  args: {
    recipients: RECIPIENTS,
    selectedRecipients: [],
    accessLevel: RecordShareAccessLevel.READ,
    canInvite: true,
    onRecipientsChange: fn(),
    onAccessLevelChange: fn(),
    onInvite: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof RecordSharingInvitation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await expect(canvas.getByRole('button', { name: 'Invite' })).toBeDisabled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add people or everyone' }),
    );
    await userEvent.type(
      await page.findByRole('searchbox', { name: 'Search people or roles' }),
      'No matching recipient',
    );
    await expect(page.getByText('No matching people or roles')).toBeVisible();
    await expect(args.onInvite).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
  },
};

export const StageAndInvite: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Add people or everyone' }),
    );
    await userEvent.click(
      await page.findByRole('button', { name: 'Sarah Lin' }),
    );
    await expect(
      page.getByRole('button', { name: 'Sarah Lin' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(page.getByRole('button', { name: 'Sales' }));
    await expect(args.onRecipientsChange).toHaveBeenLastCalledWith([
      RECIPIENTS[0],
      RECIPIENTS[2],
    ]);
    await expect(args.onInvite).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');

    await userEvent.click(canvas.getByRole('button', { name: 'Remove Sales' }));
    await expect(canvas.queryByText('Sales')).not.toBeInTheDocument();
    await expect(args.onRecipientsChange).toHaveBeenLastCalledWith([
      RECIPIENTS[0],
    ]);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Invitation access' }),
    );
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'Editor' }),
    );
    await expect(args.onAccessLevelChange).toHaveBeenLastCalledWith(
      RecordShareAccessLevel.READ_WRITE,
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Invite' }));
    await expect(args.onInvite).toHaveBeenCalledTimes(1);
    await expect(canvas.getByText('Sarah Lin')).toBeVisible();
  },
};

export const CancelSelection: Story = {
  args: { selectedRecipients: [RECIPIENTS[0], RECIPIENTS[2]] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
    await expect(canvas.queryByText('Sarah Lin')).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Invite' })).toBeDisabled();
    await expect(args.onInvite).not.toHaveBeenCalled();
  },
};

export const Submitting: Story = {
  args: { selectedRecipients: [RECIPIENTS[0]], isSubmitting: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Invite' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: 'Remove Sarah Lin' }),
    ).toBeDisabled();
    await expect(args.onInvite).not.toHaveBeenCalled();
  },
};

export const ReadOnly: Story = {
  args: { selectedRecipients: [RECIPIENTS[0]], canInvite: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Invite' })).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: 'Remove Sarah Lin' }),
    ).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Invite' }));
    await expect(args.onInvite).not.toHaveBeenCalled();
    await expect(args.onRecipientsChange).not.toHaveBeenCalled();
  },
};

export const InvitationFailed: Story = {
  args: {
    selectedRecipients: [RECIPIENTS[0], RECIPIENTS[1]],
    errorMessage: 'Sharing could not be updated. Try again.',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Sharing could not be updated. Try again.',
    );
    await expect(canvas.getByText('Sarah Lin')).toBeVisible();
    await expect(canvas.getByText('Marco Rossi')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Invite' }));
    await expect(args.onInvite).toHaveBeenCalledTimes(1);
    await expect(canvas.getByText('Marco Rossi')).toBeVisible();
  },
};

export const EveryoneCannotReceiveFullAccess: Story = {
  args: {
    selectedRecipients: [RECIPIENTS[3]],
    accessLevel: RecordShareAccessLevel.FULL,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await expect(canvas.getByRole('button', { name: 'Invite' })).toBeDisabled();
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Choose an access level available to all selected recipients.',
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Invitation access' }),
    );
    await expect(
      await page.findByRole('menuitemradio', { name: 'Viewer' }),
    ).toBeVisible();
    await expect(
      page.queryByRole('menuitemradio', { name: 'Full access' }),
    ).not.toBeInTheDocument();
    await userEvent.click(page.getByRole('menuitemradio', { name: 'Editor' }));
    await expect(canvas.getByRole('button', { name: 'Invite' })).toBeEnabled();
    await expect(args.onAccessLevelChange).toHaveBeenLastCalledWith(
      RecordShareAccessLevel.READ_WRITE,
    );
  },
};
