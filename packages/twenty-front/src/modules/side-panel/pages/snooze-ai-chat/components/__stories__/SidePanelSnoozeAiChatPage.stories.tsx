import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SidePanelSnoozeAiChatPage } from '@/side-panel/pages/snooze-ai-chat/components/SidePanelSnoozeAiChatPage';
import { snoozeAiChatThreadIdsComponentState } from '@/side-panel/pages/snooze-ai-chat/states/snoozeAiChatThreadIdsComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const PAGE_CONTEXT = { instanceId: 'snooze-ai-chat-story' };
const CLICK_OUTSIDE_ID = 'snooze-ai-chat-story-click-outside';

const meta = {
  title: 'Modules/SidePanel/SnoozeAiChat',
  component: SidePanelSnoozeAiChatPage,
  decorators: [
    (Story) => (
      <ParentClickOutsideIdContext.Provider value={CLICK_OUTSIDE_ID}>
        <SidePanelPageComponentInstanceContext.Provider value={PAGE_CONTEXT}>
          <Story />
        </SidePanelPageComponentInstanceContext.Provider>
      </ParentClickOutsideIdContext.Provider>
    ),
    MemoryRouterDecorator,
    ComponentDecorator,
    ToastDecorator,
  ],
  beforeEach: () => {
    jotaiStore.set(
      snoozeAiChatThreadIdsComponentState.atomFamily(PAGE_CONTEXT),
      ['thread-1', 'thread-2'],
    );
  },
} satisfies Meta<typeof SidePanelSnoozeAiChatPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DayAndTimePicker: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', { name: 'Day & Time' });

    await userEvent.click(trigger);

    const popup = await body.findByRole('dialog', { name: 'Day & Time' });

    await expect(popup).toHaveAttribute(
      'data-click-outside-id',
      CLICK_OUTSIDE_ID,
    );
    await expect(
      await body.findByRole('button', { name: /^Snooze until/ }),
    ).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('data-highlighted');

    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false'),
    );

    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard('{Enter}');

    await expect(
      await body.findByRole('button', { name: /^Snooze until/ }),
    ).toBeVisible();
    await expect(trigger).toHaveAttribute('data-highlighted');
  },
};
