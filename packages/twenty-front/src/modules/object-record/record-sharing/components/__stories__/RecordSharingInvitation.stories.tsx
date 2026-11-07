import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { RecordSharingInvitation } from '@/object-record/record-sharing/components/RecordSharingInvitation';
import { type RecordSharingInvitationRecipient } from '@/object-record/record-sharing/types/RecordSharingInvitationRecipient';

const RECIPIENTS: RecordSharingInvitationRecipient[] = [
  { kind: 'workspaceMember', id: 'sarah', label: 'Sarah Lin' },
  { kind: 'workspaceMember', id: 'marco', label: 'Marco Rossi' },
  { kind: 'role', id: 'sales', label: 'Sales' },
  { kind: 'everyone', id: 'workspace', label: 'Everyone with access to Chats' },
];

const InvitationStory = ({
  selectedRecipients,
  hasInvalidAccessLevel,
  canInvite,
  isSubmitting,
  search: initialSearch,
  onSearchChange,
  onInvite,
}: ComponentProps<typeof RecordSharingInvitation>) => {
  const [search, setSearch] = useState(initialSearch);

  return (
    <RecordSharingInvitation
      selectedRecipients={selectedRecipients}
      hasInvalidAccessLevel={hasInvalidAccessLevel}
      canInvite={canInvite}
      isSubmitting={isSubmitting}
      search={search}
      onSearchChange={(nextSearch) => {
        setSearch(nextSearch);
        onSearchChange(nextSearch);
      }}
      onInvite={onInvite}
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
    search: '',
    selectedRecipients: [],
    hasInvalidAccessLevel: false,
    canInvite: true,
    onSearchChange: fn(),
    onInvite: fn(),
  },
} satisfies Meta<typeof RecordSharingInvitation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Add people or everyone');

    await expect(canvas.getByRole('button', { name: 'Invite' })).toBeDisabled();
    await userEvent.type(input, 'Sarah');
    await expect(input).toHaveValue('Sarah');
    await expect(args.onSearchChange).toHaveBeenLastCalledWith('Sarah');
    await expect(args.onInvite).not.toHaveBeenCalled();
  },
};

export const StageAndInvite: Story = {
  args: { selectedRecipients: [RECIPIENTS[0], RECIPIENTS[2]] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Invite 2' }));
    await expect(args.onInvite).toHaveBeenCalledTimes(1);
  },
};

export const Submitting: Story = {
  args: { selectedRecipients: [RECIPIENTS[0]], isSubmitting: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: 'Invite 1' }),
    ).toBeDisabled();
    await expect(
      canvas.getByPlaceholderText('Add people or everyone'),
    ).toBeDisabled();
    await expect(args.onInvite).not.toHaveBeenCalled();
  },
};

export const ReadOnly: Story = {
  args: { selectedRecipients: [RECIPIENTS[0]], canInvite: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: 'Invite 1' }),
    ).toBeDisabled();
    await expect(
      canvas.getByPlaceholderText('Add people or everyone'),
    ).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Invite 1' }));
    await expect(args.onInvite).not.toHaveBeenCalled();
    await expect(args.onSearchChange).not.toHaveBeenCalled();
  },
};

export const EveryoneCannotReceiveFullAccess: Story = {
  args: {
    selectedRecipients: [RECIPIENTS[3]],
    hasInvalidAccessLevel: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: 'Invite 1' }),
    ).toBeDisabled();
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Choose an access level available to all selected recipients.',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Invite 1' }));
    await expect(args.onInvite).not.toHaveBeenCalled();
  },
};
