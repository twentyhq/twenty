import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IconButton } from 'twenty-ui/components/input';
import { IconDotsVertical } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { NavigationDrawerAiChatChannelNavigation } from '@/ai/components/NavigationDrawerAiChatChannelNavigation';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerConstraints';
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
  box-sizing: border-box;
  padding: ${themeCssVariables.spacing[2]};
  width: ${NAVIGATION_DRAWER_CONSTRAINTS.default}px;
`;

const OPEN_VIEW: AgentChatChannelView = {
  channelId: 'sales',
  channelStatus: AgentChatChannelThreadStatus.OPEN,
  assignment: AgentChatChannelAssignmentFilter.ANY,
};

const OPEN_CHANNEL_LABEL_PATTERN = /^Open\s*·\s*6$/;
const ASSIGNED_CHANNEL_LABEL_PATTERN = /^Assigned\s*·\s*1$/;
const INACCESSIBLE_CHANNEL_LABEL_PATTERN = /^Sales\s*·\s*Not open to you$/;

const onOptions = fn();

const CHANNEL_OPTIONS = (
  <IconButton aria-label="Channel options" onClick={onOptions} size="sm">
    <IconDotsVertical />
  </IconButton>
);

const ChannelNavigationStory = ({
  channel,
  summary,
  isExpandable,
  rightOptions,
}: Pick<
  ComponentProps<typeof NavigationDrawerAiChatChannelNavigation>,
  'channel' | 'summary' | 'isExpandable' | 'rightOptions'
>) => {
  const channelView = useAtomStateValue(agentChatChannelViewState);

  return (
    <StyledNavigation>
      <NavigationDrawerAiChatChannelNavigation
        channel={channel}
        summary={summary}
        channelView={channelView}
        isActive={channelView?.channelId === channel.id}
        isExpandable={isExpandable}
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
  beforeEach: ({ args }) => {
    jotaiStore.set(isNavigationDrawerExpandedState.atom, true);
    jotaiStore.set(agentChatChannelViewState.atom, args.channelView);

    return () => {
      jotaiStore.set(isNavigationDrawerExpandedState.atom, true);
      jotaiStore.set(agentChatChannelViewState.atom, null);
    };
  },
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
  },
} satisfies Meta<typeof NavigationDrawerAiChatChannelNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: OPEN_CHANNEL_LABEL_PATTERN }),
    ).toHaveAttribute('aria-current', 'true');
    await userEvent.click(
      canvas.getByRole('button', { name: ASSIGNED_CHANNEL_LABEL_PATTERN }),
    );
    await expect(jotaiStore.get(agentChatChannelViewState.atom)).toEqual({
      ...OPEN_VIEW,
      assignment: AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME,
    });
    await expect(
      canvas.getByRole('button', { name: ASSIGNED_CHANNEL_LABEL_PATTERN }),
    ).toHaveAttribute('aria-current', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Snoozed' }));
    await expect(jotaiStore.get(agentChatChannelViewState.atom)).toEqual({
      ...OPEN_VIEW,
      channelStatus: AgentChatChannelThreadStatus.SNOOZED,
    });
    await userEvent.click(canvas.getByRole('button', { name: 'Done' }));
    await expect(jotaiStore.get(agentChatChannelViewState.atom)).toEqual({
      ...OPEN_VIEW,
      channelStatus: AgentChatChannelThreadStatus.DONE,
    });
    await userEvent.click(canvas.getByRole('button', { name: 'Sales' }));
    await expect(
      canvas.queryByRole('button', { name: OPEN_CHANNEL_LABEL_PATTERN }),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Sales' }));
    await expect(canvas.getByRole('button', { name: 'Done' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await expect(jotaiStore.get(agentChatChannelViewState.atom)).toEqual({
      ...OPEN_VIEW,
      channelStatus: AgentChatChannelThreadStatus.DONE,
    });
  },
};

export const Collapsed: Story = {
  args: { channelView: null, isActive: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const channel = canvas.getByRole('button', { name: 'Sales' });

    await expect(channel).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(channel);
    await expect(jotaiStore.get(agentChatChannelViewState.atom)).toEqual(
      OPEN_VIEW,
    );
    await expect(channel).toHaveAttribute('aria-expanded', 'true');
  },
};

export const KeyboardAndOptions: Story = {
  args: {
    channelView: null,
    isActive: false,
    rightOptions: CHANNEL_OPTIONS,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const channel = canvas.getByRole('button', { name: 'Sales' });

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
    await expect(channel).toHaveAttribute('aria-expanded', 'true');
    await expect(jotaiStore.get(agentChatChannelViewState.atom)).toEqual(
      OPEN_VIEW,
    );
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: OPEN_CHANNEL_LABEL_PATTERN }),
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
      canvas.getByRole('button', { name: OPEN_CHANNEL_LABEL_PATTERN }),
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
    await expect(channel).not.toHaveAttribute('aria-expanded');
    await expect(
      canvas.queryByRole('button', { name: OPEN_CHANNEL_LABEL_PATTERN }),
    ).not.toBeInTheDocument();
  },
};

export const Favorite: Story = {
  args: { isExpandable: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const channel = canvas.getByRole('button', { name: 'Sales' });

    await expect(channel).toHaveAttribute('aria-current', 'true');
    await expect(channel).not.toHaveAttribute('aria-expanded');
    await userEvent.click(channel);
    await expect(jotaiStore.get(agentChatChannelViewState.atom)).toEqual(
      OPEN_VIEW,
    );
    await expect(
      canvas.queryByRole('button', { name: OPEN_CHANNEL_LABEL_PATTERN }),
    ).not.toBeInTheDocument();
  },
};

export const SameViewKeepsCollapsed: Story = {
  render: (args) => (
    <>
      <ChannelNavigationStory channel={args.channel} summary={args.summary} />
      <Button
        onClick={() =>
          jotaiStore.set(agentChatChannelViewState.atom, { ...OPEN_VIEW })
        }
      >
        Reselect view
      </Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const channel = canvas.getByRole('button', { name: 'Sales' });

    await userEvent.click(channel);
    await expect(channel).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Reselect view' }),
    );
    await expect(channel).toHaveAttribute('aria-expanded', 'false');
    await expect(
      canvas.queryByRole('button', { name: OPEN_CHANNEL_LABEL_PATTERN }),
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
    rightOptions: CHANNEL_OPTIONS,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByRole('button', {
        name: INACCESSIBLE_CHANNEL_LABEL_PATTERN,
      }),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByText(/Not open to you/));
    await expect(jotaiStore.get(agentChatChannelViewState.atom)).toBeNull();
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Channel options' }),
    ).toHaveFocus();
    await expect(
      canvas.queryByRole('button', { name: 'Open' }),
    ).not.toBeInTheDocument();
  },
};

export const ReturnToTriage: Story = {
  args: { channelView: null, isActive: false },
  render: (args) => (
    <>
      <ChannelNavigationStory channel={args.channel} summary={args.summary} />
      <Button
        onClick={() => jotaiStore.set(agentChatChannelViewState.atom, null)}
      >
        Open triage
      </Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const channel = canvas.getByRole('button', { name: 'Sales' });

    await userEvent.click(channel);
    await expect(channel).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Open triage' }));
    await expect(channel).toHaveAttribute('aria-expanded', 'false');
    await expect(
      canvas.queryByRole('button', { name: OPEN_CHANNEL_LABEL_PATTERN }),
    ).not.toBeInTheDocument();
  },
};
