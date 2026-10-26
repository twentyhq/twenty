import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IconButton } from 'twenty-ui/components/input';
import { IconDotsVertical } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { NavigationDrawerAiChatChannelNavigation } from '@/ai/components/NavigationDrawerAiChatChannelNavigation';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';

const StyledNavigation = styled.div`
  background: ${themeCssVariables.background.secondary};
  padding: ${themeCssVariables.spacing[2]};
  width: 204px;
`;

const OPEN_VIEW: AgentChatChannelView = {
  channelId: 'sales',
  channelStatus: AgentChatChannelThreadStatus.OPEN,
  assignment: AgentChatChannelAssignmentFilter.ANY,
};

const onOptions = fn();

const ChannelNavigationStory = ({
  channel,
  summary,
  channelView: initialChannelView,
  onNavigate,
  rightOptions,
}: ComponentProps<typeof NavigationDrawerAiChatChannelNavigation>) => {
  const [channelView, setChannelView] = useState(initialChannelView);

  const handleNavigate = (nextChannelView: AgentChatChannelView) => {
    onNavigate(nextChannelView);
    setChannelView(nextChannelView);
  };

  return (
    <StyledNavigation>
      <NavigationDrawerAiChatChannelNavigation
        channel={channel}
        summary={summary}
        channelView={channelView}
        isActive={channelView?.channelId === channel.id}
        onNavigate={handleNavigate}
        rightOptions={rightOptions}
      />
    </StyledNavigation>
  );
};

const meta = {
  title: 'Modules/AI/NavigationDrawerAiChatChannelNavigation',
  component: NavigationDrawerAiChatChannelNavigation,
  decorators: [IconsProviderDecorator, ComponentWithRouterDecorator],
  render: ChannelNavigationStory,
  args: {
    channel: {
      id: 'sales',
      name: 'Sales',
      icon: 'IconBrandShopee',
      color: 'green',
      isAccessible: true,
      isCustom: true,
      position: 1,
      roleIds: [],
    },
    summary: {
      openCount: 6,
      hasUnreadOpen: false,
      assignedToMeCount: 1,
      hasUnreadAssignedToMe: false,
      snoozedCount: 0,
      doneCount: 0,
    },
    channelView: OPEN_VIEW,
    isActive: true,
    onNavigate: fn(),
  },
} satisfies Meta<typeof NavigationDrawerAiChatChannelNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: 'Open · 6' }),
    ).toHaveAttribute('aria-current', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Assigned · 1' }));
    await expect(args.onNavigate).toHaveBeenLastCalledWith({
      ...OPEN_VIEW,
      assignment: AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME,
    });
    await expect(
      canvas.getByRole('button', { name: 'Assigned · 1' }),
    ).toHaveAttribute('aria-current', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Snoozed' }));
    await expect(args.onNavigate).toHaveBeenLastCalledWith({
      ...OPEN_VIEW,
      channelStatus: AgentChatChannelThreadStatus.SNOOZED,
    });
    await userEvent.click(canvas.getByRole('button', { name: 'Done' }));
    await expect(args.onNavigate).toHaveBeenLastCalledWith({
      ...OPEN_VIEW,
      channelStatus: AgentChatChannelThreadStatus.DONE,
    });
    await userEvent.click(canvas.getByRole('button', { name: 'Sales' }));
    await expect(
      canvas.queryByRole('button', { name: 'Open · 6' }),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Sales' }));
    await expect(canvas.getByRole('button', { name: 'Done' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await expect(args.onNavigate).toHaveBeenCalledTimes(3);
  },
};

export const Collapsed: Story = {
  args: { channelView: null, isActive: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const channel = canvas.getByRole('button', { name: 'Sales' });

    await expect(channel).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(channel);
    await expect(args.onNavigate).toHaveBeenCalledWith(OPEN_VIEW);
    await expect(channel).toHaveAttribute('aria-expanded', 'true');
  },
};

export const KeyboardAndOptions: Story = {
  args: {
    channelView: null,
    isActive: false,
    rightOptions: (
      <IconButton aria-label="Channel options" onClick={onOptions} size="sm">
        <IconDotsVertical />
      </IconButton>
    ),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const channel = canvas.getByRole('button', { name: /^Sales/ });

    await userEvent.tab();
    await expect(channel).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(channel).toHaveAttribute('aria-expanded', 'true');
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Channel options' }),
    ).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(onOptions).toHaveBeenCalledTimes(1);
    await expect(args.onNavigate).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Open · 6' }),
    ).toHaveFocus();
  },
};

export const Assigned: Story = {
  args: {
    channelView: {
      ...OPEN_VIEW,
      assignment: AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME,
    },
  },
};

export const Unassigned: Story = {
  args: {
    channelView: {
      ...OPEN_VIEW,
      assignment: AgentChatChannelAssignmentFilter.UNASSIGNED,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: 'Open · 6' }),
    ).toHaveAttribute('aria-current', 'true');
  },
};

export const CollapsedDrawer: Story = {
  beforeEach: () => {
    jotaiStore.set(isNavigationDrawerExpandedState.atom, false);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const channel = canvas.getByRole('button', { name: 'Sales' });

    await expect(channel).toHaveAttribute('aria-current', 'true');
    await expect(channel).toHaveAttribute('aria-expanded', 'false');
    await expect(
      canvas.queryByRole('button', { name: 'Open · 6' }),
    ).not.toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: {
    summary: {
      openCount: 0,
      hasUnreadOpen: false,
      assignedToMeCount: 0,
      hasUnreadAssignedToMe: false,
      snoozedCount: 0,
      doneCount: 0,
    },
  },
};

export const Unread: Story = {
  args: {
    summary: {
      ...meta.args.summary,
      hasUnreadOpen: true,
      hasUnreadAssignedToMe: true,
    },
  },
};

export const Inaccessible: Story = {
  args: {
    channel: { ...meta.args.channel, isAccessible: false },
    channelView: null,
    isActive: false,
    summary: undefined,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Sales · Not open to you' }),
    );
    await expect(args.onNavigate).not.toHaveBeenCalled();
    await expect(
      canvas.queryByRole('button', { name: 'Open' }),
    ).not.toBeInTheDocument();
  },
};
