// @vitest-environment jsdom
import { act } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { i18n } from '@lingui/core';
import { messages } from '../locales/en';
import { createInitialState } from '../../shared/create-initial-state';
import { type CompanionCommand } from '../../shared/types';
import { createDeferred } from '../../main/__tests__/create-deferred';
import { useCompanion } from '../useCompanion';

const Controls = () => {
  const { command, isPending, state } = useCompanion();
  return (
    <>
      <button
        disabled={isPending('settings')}
        onClick={() =>
          void command({ type: 'settings', settings: { autoJoin: false } })
        }
      >
        Save settings
      </button>
      <button
        disabled={isPending('stop')}
        onClick={() => void command({ type: 'stop' })}
      >
        Finish recording
      </button>
      <button onClick={() => void command({ type: 'dismiss-error' })}>
        Dismiss
      </button>
      <button
        onClick={() =>
          void command({ type: 'connect', serverUrl: 'https://twenty.com' })
        }
      >
        Connect
      </button>
      <button onClick={() => void command({ type: 'cancel-connect' })}>
        Cancel connection
      </button>
      {state.error && <p role="alert">{state.error.message}</p>}
    </>
  );
};
beforeEach(() => {
  i18n.load('en', messages);
  i18n.activate('en');
  window.companion = {
    getState: async () => createInitialState(),
    command: vi.fn().mockResolvedValue(undefined),
    onState: () => () => undefined,
    onNavigate: () => () => undefined,
  };
});
afterEach(() => {
  cleanup();
  delete window.companion;
});

it('keeps recording controls and dismissal available during a settings save', async () => {
  const pending = createDeferred<void>();
  const command = vi
    .mocked(window.companion!.command)
    .mockImplementation(async (command: CompanionCommand) => {
      if (command.type === 'settings') await pending.promise;
    });
  render(<Controls />);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Save settings' }));
  expect(
    (screen.getByRole('button', { name: 'Save settings' }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  await user.click(screen.getByRole('button', { name: 'Finish recording' }));
  await user.click(screen.getByRole('button', { name: 'Dismiss' }));
  expect(command).toHaveBeenCalledWith({ type: 'stop' });
  expect(command).toHaveBeenCalledWith({ type: 'dismiss-error' });
  await act(async () => pending.resolve());
  await waitFor(() =>
    expect(
      (
        screen.getByRole('button', {
          name: 'Save settings',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false),
  );
});

it('delivers cancellation while sign-in is still pending', async () => {
  const pending = createDeferred<void>();
  const command = vi
    .mocked(window.companion!.command)
    .mockImplementation(async (command) => {
      if (command.type === 'connect') await pending.promise;
      if (command.type === 'cancel-connect') pending.resolve();
    });
  render(<Controls />);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Connect' }));
  await user.click(screen.getByRole('button', { name: 'Cancel connection' }));
  expect(command).toHaveBeenCalledWith({ type: 'cancel-connect' });
});

it('releases a failed action so it can be retried', async () => {
  vi.mocked(window.companion!.command).mockRejectedValueOnce(
    new Error('IPC disconnected'),
  );
  render(<Controls />);
  await userEvent
    .setup()
    .click(screen.getByRole('button', { name: 'Save settings' }));
  expect((await screen.findByRole('alert')).textContent).toContain(
    'Please try again',
  );
  expect(
    (screen.getByRole('button', { name: 'Save settings' }) as HTMLButtonElement)
      .disabled,
  ).toBe(false);
});
