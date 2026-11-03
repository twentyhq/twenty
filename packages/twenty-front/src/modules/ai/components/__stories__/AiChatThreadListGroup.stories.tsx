import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatThreadListGroup } from '@/ai/components/AiChatThreadListGroup';
import { AiChatThreadActivityTime } from '@/ai/components/AiChatThreadActivityTime';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { groupThreadsBySnoozeTime } from '@/ai/utils/groupThreadsBySnoozeTime';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const meta: Meta<typeof AiChatThreadListGroup> = {
  title: 'Modules/AI/AiChatThreadListGroup',
  component: AiChatThreadListGroup,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 560 } },
};

export default meta;
type Story = StoryObj<typeof AiChatThreadListGroup>;

const getTimedSnoozeScenario = () => {
  const today = new Date();
  const nextWeekThursdayOffset = ((8 - today.getUTCDay()) % 7 || 7) + 3;
  const getWakeTime = ({
    daysFromToday,
    hour,
  }: {
    daysFromToday: number;
    hour: number;
  }) => {
    const wakeDate = new Date(today);
    wakeDate.setUTCDate(wakeDate.getUTCDate() + daysFromToday);
    wakeDate.setUTCHours(hour, 0, 0, 0);

    return wakeDate.toISOString();
  };
  const snoozedUntilByThreadId: Record<string, string> = {
    newsletter: getWakeTime({
      daysFromToday: nextWeekThursdayOffset,
      hour: 9,
    }),
    board: getWakeTime({ daysFromToday: 1, hour: 15 }),
    sponsorship: getWakeTime({ daysFromToday: 1, hour: 9 }),
    churn: getWakeTime({ daysFromToday: 0, hour: 18 }),
  };
  const threads: AgentChatThreadRecord[] = [
    { id: 'newsletter', title: 'Partner newsletter' },
    { id: 'board', title: 'Board deck numbers' },
    { id: 'sponsorship', title: 'Event sponsorship deck' },
    { id: 'churn', title: 'Churn risk accounts' },
  ].map((thread) => ({
    ...thread,
    __typename: 'AgentChatThread',
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
    lastActivityAt: today.toISOString(),
    deletedAt: null,
  }));

  return { today, threads, snoozedUntilByThreadId };
};

export const TimedWakeGroups: Story = {
  beforeEach: () => {
    const workspaceMemberFormatPreferences = jotaiStore.get(
      workspaceMemberFormatPreferencesState.atom,
    );
    jotaiStore.set(workspaceMemberFormatPreferencesState.atom, {
      ...workspaceMemberFormatPreferences,
      timeZone: 'UTC',
      timeFormat: TimeFormat.HOUR_24,
    });
  },
  render: () => {
    const { today, threads, snoozedUntilByThreadId } = getTimedSnoozeScenario();
    const groups = groupThreadsBySnoozeTime({
      threads,
      snoozedUntilByThreadId,
      today,
      timeZone: 'UTC',
    });

    return (
      <>
        {groups.map((group) => (
          <AiChatThreadListGroup key={group.id} title={group.title}>
            {group.threads.map((thread) => (
              <ListItem
                key={thread.id}
                startIcon={<Avatar name="Sarah Lin" size="sm" />}
                description={
                  <AiChatThreadActivityTime
                    thread={thread}
                    snoozedUntil={snoozedUntilByThreadId[thread.id]}
                  />
                }
                descriptionPlacement="end"
              >
                {thread.title}
              </ListItem>
            ))}
          </AiChatThreadListGroup>
        ))}
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getAllByRole('heading').map((heading) => heading.textContent),
    ).toEqual(['Later today', 'Tomorrow', 'Next week']);
    await expect(
      within(canvas.getByRole('region', { name: 'Later today' })).getByText(
        '18:00',
      ),
    ).toBeVisible();
    const tomorrow = within(canvas.getByRole('region', { name: 'Tomorrow' }));

    await expect(tomorrow.getByText('09:00')).toBeVisible();
    await expect(tomorrow.getByText('15:00')).toBeVisible();
    await expect(
      tomorrow
        .getAllByText(/Event sponsorship deck|Board deck numbers/)
        .map((title) => title.textContent),
    ).toEqual(['Event sponsorship deck', 'Board deck numbers']);
    await expect(
      within(canvas.getByRole('region', { name: 'Next week' })).getByText(
        'Thu · 09:00',
      ),
    ).toBeVisible();
  },
};

export const Snoozed: Story = {
  render: () => (
    <>
      <AiChatThreadListGroup title="Later today" count={1}>
        <ListItem
          startIcon={<Avatar name="Sarah Lin" size="sm" />}
          description="18:00"
          descriptionPlacement="end"
        >
          Churn risk accounts
        </ListItem>
      </AiChatThreadListGroup>
      <AiChatThreadListGroup title="Tomorrow" count={2}>
        <ListItem
          startIcon={<Avatar name="Sarah Lin" size="sm" />}
          description="09:00"
          descriptionPlacement="end"
        >
          Event sponsorship deck
        </ListItem>
        <ListItem description="09:00" descriptionPlacement="end">
          Board deck numbers
        </ListItem>
      </AiChatThreadListGroup>
      <AiChatThreadListGroup title="Until something happens" count={1}>
        <ListItem description="When Ada finishes" descriptionPlacement="end">
          Q4 forecast
        </ListItem>
      </AiChatThreadListGroup>
    </>
  ),
};

export const WithoutCount: Story = {
  args: {
    title: 'Tomorrow',
    children: (
      <ListItem description="09:00" descriptionPlacement="end">
        Board deck numbers
      </ListItem>
    ),
  },
};
