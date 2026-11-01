import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { EmailThreadPreview } from '@/activities/emails/components/EmailThreadPreview';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  MessageChannelVisibility,
  type TimelineThread,
} from '~/generated/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';

const thread: TimelineThread = {
  id: '1b2032b1-49da-4b23-8676-916cb19b93fa',
  read: true,
  visibility: MessageChannelVisibility.SHARE_EVERYTHING,
  firstParticipant: {
    personId: '16b5acc6-4f11-43bf-90d4-7e5501f1c2a4',
    workspaceMemberId: null,
    firstName: 'Charles',
    lastName: 'Bochet',
    displayName: 'Charles Bochet',
    avatarUrl: '',
    handle: 'charles@twenty.com',
  },
  lastTwoParticipants: [],
  lastMessageReceivedAt: '2026-10-08T18:00:44.000Z',
  lastMessageBody: 'Happy to walk you through the setup',
  lastMessageIsDraft: false,
  subject: 'A quick hello from Twenty',
  numberOfMessagesInThread: 1,
  participantCount: 1,
};

const meta: Meta<typeof EmailThreadPreview> = {
  title: 'Modules/Activities/Emails/EmailThreadPreview',
  component: EmailThreadPreview,
  decorators: [
    MemoryRouterDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
  ],
  args: { thread },
};

export default meta;
type Story = StoryObj<typeof EmailThreadPreview>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('A quick hello from Twenty');
    await expect(canvas.queryByText('Draft')).not.toBeInTheDocument();
  },
};

export const Draft: Story = {
  args: { thread: { ...thread, lastMessageIsDraft: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Draft')).toBeVisible();
  },
};

export const DraftWithSubjectVisibility: Story = {
  args: {
    thread: {
      ...thread,
      lastMessageIsDraft: true,
      visibility: MessageChannelVisibility.SUBJECT,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Draft')).toBeVisible();
    await expect(canvas.getByText('Not shared')).toBeVisible();
    await expect(
      canvas.queryByText('Happy to walk you through the setup'),
    ).not.toBeInTheDocument();
  },
};

export const DraftWithMetadataVisibility: Story = {
  args: {
    thread: {
      ...thread,
      lastMessageIsDraft: true,
      visibility: MessageChannelVisibility.METADATA,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Draft')).toBeVisible();
    await expect(canvas.getByText('Not shared')).toBeVisible();
    await expect(
      canvas.queryByText('A quick hello from Twenty'),
    ).not.toBeInTheDocument();
  },
};
