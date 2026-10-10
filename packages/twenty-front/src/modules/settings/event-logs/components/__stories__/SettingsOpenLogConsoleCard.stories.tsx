import { isLogConsoleFullScreenState } from '@/log-console/states/isLogConsoleFullScreenState';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { SettingsOpenLogConsoleCard } from '@/settings/event-logs/components/SettingsOpenLogConsoleCard';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof SettingsOpenLogConsoleCard> = {
  title: 'Modules/Settings/EventLogs/OpenLogConsoleCard',
  component: SettingsOpenLogConsoleCard,
  decorators: [ComponentDecorator],
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'closed');
    jotaiStore.set(isLogConsoleFullScreenState.atom, true);
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const OpensLogConsole: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Open log console' }),
    );

    await waitFor(() => {
      expect(jotaiStore.get(logConsoleDisplayModeState.atom)).toBe('open');
      expect(jotaiStore.get(isLogConsoleFullScreenState.atom)).toBe(false);
    });
  },
};
