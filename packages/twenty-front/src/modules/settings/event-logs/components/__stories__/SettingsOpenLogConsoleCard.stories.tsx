import { isLogConsoleFullScreenState } from '@/log-console/states/isLogConsoleFullScreenState';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { logConsoleHeightState } from '@/log-console/states/logConsoleHeightState';
import { SettingsOpenLogConsoleCard } from '@/settings/event-logs/components/SettingsOpenLogConsoleCard';
import { isLogConsoleEnabledState } from '@/log-console/states/isLogConsoleEnabledState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof SettingsOpenLogConsoleCard> = {
  title: 'Modules/Settings/EventLogs/OpenLogConsoleCard',
  component: SettingsOpenLogConsoleCard,
  decorators: [ComponentDecorator],
  beforeEach: () => {
    jotaiStore.set(isLogConsoleEnabledState.atom, false);
    jotaiStore.set(logConsoleDisplayModeState.atom, 'collapsed');
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
      expect(jotaiStore.get(isLogConsoleEnabledState.atom)).toBe(true);
      expect(jotaiStore.get(logConsoleDisplayModeState.atom)).toBe('open');
      expect(jotaiStore.get(isLogConsoleFullScreenState.atom)).toBe(false);
    });
  },
};

export const KeepsConsoleHeightWhenLogsSwitchIsOn: Story = {
  beforeEach: () => {
    jotaiStore.set(isLogConsoleEnabledState.atom, true);
    jotaiStore.set(logConsoleHeightState.atom, 450);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Open log console' }),
    );

    await waitFor(() => {
      expect(jotaiStore.get(logConsoleDisplayModeState.atom)).toBe('open');
      expect(jotaiStore.get(isLogConsoleFullScreenState.atom)).toBe(false);
      expect(jotaiStore.get(logConsoleHeightState.atom)).toBe(450);
    });
  },
};
