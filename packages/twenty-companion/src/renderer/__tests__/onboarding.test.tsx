// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { i18n } from '@lingui/core';
import { Onboarding } from '../Onboarding';
import { ThemeProvider } from '@ui/theme-constants/ThemeProvider';
import { createInitialState } from '../../shared/create-initial-state';
import { type CompanionState } from '../../shared/types';
import { messages } from '../locales/en';

const command = vi.fn().mockResolvedValue(undefined);
const page = (state: CompanionState) => (
  <ThemeProvider colorScheme="light">
    <Onboarding state={state} command={command} isPending={() => false} />
  </ThemeProvider>
);
const connectedState = (): CompanionState => ({
  ...createInitialState(),
  connection: 'connected',
  updatedAt: new Date().toISOString(),
  permissions: {
    microphone: 'granted',
    'system-audio': 'granted',
    accessibility: 'granted',
  },
});
beforeEach(() => {
  command.mockClear();
  i18n.load('en', messages);
  i18n.activate('en');
});
afterEach(cleanup);

it('shows connection before permissions and waits for the workspace to load', () => {
  const { rerender } = render(page(createInitialState()));
  expect(
    screen.getByRole('heading', { name: 'Connect your workspace' }),
  ).toBeDefined();
  rerender(page({ ...connectedState(), updatedAt: null }));
  expect(
    screen.getByRole('heading', { name: 'Connecting your workspace' }),
  ).toBeDefined();
  expect(screen.queryByRole('button', { name: 'Finish' })).toBeNull();
});

it('completes first-time setup through the ready screen without starting a recording', async () => {
  render(page(connectedState()));
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Finish' }));
  expect(command).toHaveBeenCalledExactlyOnceWith({
    type: 'cancel-permission-setup',
  });
  await user.click(screen.getByRole('button', { name: 'Open my workspace' }));
  expect(command).toHaveBeenLastCalledWith({ type: 'complete-setup' });
  expect(command.mock.calls.some(([value]) => value.type === 'record')).toBe(
    false,
  );
});

it('returns from settings permission review without showing first-time setup', async () => {
  const state = connectedState();
  state.settings.setupCompleted = true;
  state.permissionSetup = {};
  render(page(state));
  await userEvent.setup().click(screen.getByRole('button', { name: 'Finish' }));
  expect(command).toHaveBeenCalledExactlyOnceWith({
    type: 'cancel-permission-setup',
  });
  expect(
    screen.queryByRole('button', { name: 'Open my workspace' }),
  ).toBeNull();
});

it('keeps required permissions enforced and preserves an explicit recording intent', async () => {
  const state = connectedState();
  state.settings.setupCompleted = true;
  state.permissionSetup = { intent: 'record', windowId: 'call-window' };
  const { rerender } = render(
    page({
      ...state,
      permissions: { ...state.permissions, microphone: 'denied' },
    }),
  );
  expect(
    (
      screen.getByRole('button', {
        name: 'Start recording',
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  rerender(page(state));
  await userEvent
    .setup()
    .click(screen.getByRole('button', { name: 'Start recording' }));
  expect(command).toHaveBeenCalledExactlyOnceWith({
    type: 'record',
    windowId: 'call-window',
  });
});
