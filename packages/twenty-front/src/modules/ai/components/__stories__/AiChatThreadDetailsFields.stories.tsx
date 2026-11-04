import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DetailsRow } from 'twenty-ui/components/data-display';
import { IconLink, IconUsers } from 'twenty-ui/icon';
import { Avatar, Chip } from 'twenty-ui/primitives/data-display';
import { ComponentDecorator } from 'twenty-ui/testing';
import { themeCssVariables } from 'twenty-ui/theme';

import { AI_CHAT_THREAD_DETAILS_LABEL_WIDTH_IN_PX } from '@/ai/constants/AiChatThreadDetailsLabelWidthInPx';
import { AiChatThreadFollowersField } from '@/ai/components/AiChatThreadFollowersField';
import { AiChatThreadLabelsField } from '@/ai/components/AiChatThreadLabelsField';
import { AiChatThreadStatusField } from '@/ai/components/AiChatThreadStatusField';
import { type AiChatThreadLabel } from '@/ai/types/AiChatThreadLabel';
import { type AiChatThreadStatusScope } from '@/ai/types/AiChatThreadStatusScope';

const StyledFields = styled.dl`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin: 0;
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const LABELS: AiChatThreadLabel[] = [
  { id: 'pipeline', label: 'Pipeline', color: 'blue' },
  { id: 'quarter', label: 'Q4', color: 'purple' },
];
const CURRENT_MEMBER = { id: 'thomas', name: 'Thomas' };
const OTHER_FOLLOWER = { id: 'marco', name: 'Marco Rossi' };
const onStatusChange = fn();
const onLabelsChange = fn();
const onFollowingChange = fn();

type AiChatThreadDetailsFieldsStoryProps = {
  scope: AiChatThreadStatusScope;
  isReadOnly?: boolean;
  isSaving?: boolean;
  isEmpty?: boolean;
};

const AiChatThreadDetailsFieldsStory = ({
  scope,
  isReadOnly = false,
  isSaving = false,
  isEmpty = false,
}: AiChatThreadDetailsFieldsStoryProps) => {
  const [status, setStatus] =
    useState<ComponentProps<typeof AiChatThreadStatusField>['status']>('open');
  const [selectedLabelIds, setSelectedLabelIds] = useState(
    isEmpty ? [] : ['pipeline', 'quarter'],
  );
  const [isFollowing, setIsFollowing] = useState(!isEmpty);
  const followers = [
    ...(isFollowing ? [CURRENT_MEMBER] : []),
    ...(isEmpty ? [] : [OTHER_FOLLOWER]),
  ];
  const handleStatusChange: NonNullable<
    ComponentProps<typeof AiChatThreadStatusField>['onStatusChange']
  > = (change) => {
    onStatusChange(change);
    setStatus(change.status);
  };
  const handleLabelsChange = (labelIds: string[]) => {
    onLabelsChange(labelIds);
    setSelectedLabelIds(labelIds);
  };
  const handleFollowingChange = (nextIsFollowing: boolean) => {
    onFollowingChange(nextIsFollowing);
    setIsFollowing(nextIsFollowing);
  };

  return (
    <StyledFields>
      <AiChatThreadStatusField
        status={status}
        scope={scope}
        isSaving={isSaving}
        onStatusChange={isReadOnly ? undefined : handleStatusChange}
      />
      <DetailsRow
        labelWidth={AI_CHAT_THREAD_DETAILS_LABEL_WIDTH_IN_PX}
        startIcon={<IconLink size={themeCssVariables.icon.size.md} />}
        label="Linked to"
      >
        {['Anthropic', 'Open AI', 'Google'].map((name) => (
          <Chip
            key={name}
            variant="soft"
            startElement={<Avatar name={name} size="sm" shape="square" />}
          >
            {name}
          </Chip>
        ))}
      </DetailsRow>
      <DetailsRow
        labelWidth={AI_CHAT_THREAD_DETAILS_LABEL_WIDTH_IN_PX}
        startIcon={<IconUsers size={themeCssVariables.icon.size.md} />}
        label="Assignee"
      >
        <Chip
          variant="soft"
          startElement={<Avatar name="Thomas" size="sm" shape="circle" />}
        >
          Thomas
        </Chip>
      </DetailsRow>
      <AiChatThreadLabelsField
        labels={LABELS}
        selectedLabelIds={selectedLabelIds}
        isSaving={isSaving}
        onLabelsChange={isReadOnly ? undefined : handleLabelsChange}
      />
      <AiChatThreadFollowersField
        followers={followers}
        isFollowing={isFollowing}
        isSaving={isSaving}
        onFollowingChange={isReadOnly ? undefined : handleFollowingChange}
      />
    </StyledFields>
  );
};

const meta = {
  title: 'Modules/AI/AiChatThreadDetailsFields',
  component: AiChatThreadDetailsFieldsStory,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 400 } },
  args: { scope: { type: 'personal' } },
  beforeEach: () => {
    onStatusChange.mockClear();
    onLabelsChange.mockClear();
    onFollowingChange.mockClear();
  },
} satisfies Meta<typeof AiChatThreadDetailsFieldsStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PersonalInbox: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Change status in Your inbox' }),
    );
    await userEvent.click(
      await body.findByRole('menuitemradio', { name: 'Done' }),
    );
    await expect(onStatusChange).toHaveBeenLastCalledWith({
      status: 'done',
      scope: { type: 'personal' },
    });
    await expect(canvas.getByText('Done')).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit shared labels' }),
    );
    await userEvent.click(
      await body.findByRole('menuitemcheckbox', { name: 'Q4' }),
    );
    await expect(onLabelsChange).toHaveBeenLastCalledWith(['pipeline']);
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByText('Q4')).not.toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Unfollow for me' }),
    );
    await expect(onFollowingChange).toHaveBeenLastCalledWith(false);
    await expect(canvas.getByText('Marco Rossi')).toBeVisible();
    await expect(canvas.getAllByText('Thomas')).toHaveLength(1);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Follow for me' }),
    );
    await expect(onFollowingChange).toHaveBeenLastCalledWith(true);
    await expect(canvas.getAllByText('Thomas')).toHaveLength(2);
  },
};

export const ChannelConversation: Story = {
  args: {
    scope: { type: 'channel', channelId: 'sales', channelName: 'Sales' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Change status in Sales' }),
    );
    await userEvent.click(
      await body.findByRole('menuitemradio', { name: 'Snoozed' }),
    );
    await expect(onStatusChange).toHaveBeenLastCalledWith({
      status: 'snoozed',
      scope: { type: 'channel', channelId: 'sales', channelName: 'Sales' },
    });
  },
};

export const ReadOnly: Story = {
  args: { isReadOnly: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await expect(canvas.getByText('Pipeline')).toBeVisible();
    await expect(canvas.getByText('Marco Rossi')).toBeVisible();
  },
};

export const Saving: Story = {
  args: { isSaving: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const button of canvas.getAllByRole('button')) {
      await expect(button).toBeDisabled();
    }
  },
};

export const Empty: Story = {
  args: { isEmpty: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByText('None')).toHaveLength(2);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Follow for me' }),
    );
    await expect(onFollowingChange).toHaveBeenCalledWith(true);
    await expect(canvas.getAllByText('None')).toHaveLength(1);
  },
};

export const Narrow: Story = {
  args: { isReadOnly: true },
  parameters: { container: { width: 320 } },
};
