// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { TeamsSettings } from 'src/front-components/components/TeamsSettings';

const { featureFlags, variables, queryMock, mutationMock } = vi.hoisted(() => {
  const variables: Record<string, string | undefined> = {};

  return {
    featureFlags: {
      IS_CHAT_ASSISTANT_ENABLED: false,
      IS_TRANSCRIPT_IMPORT_ENABLED: false,
    },
    variables,
    queryMock: vi.fn(),
    mutationMock: vi.fn(),
  };
});

const APPLICATION_QUERY = {
  findOneApplication: {
    __args: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
    id: true,
  },
};
const SETTINGS_QUERY = {
  findOneApplication: {
    __args: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
    applicationVariables: { key: true, value: true },
  },
};

vi.mock('src/feature-flags/feature-flags', () => ({
  FEATURE_FLAGS: featureFlags,
}));

vi.mock('twenty-sdk/front-component', () => ({
  getApplicationVariable: (key: string) => variables[key],
  useTranslate: () => ({ t: (message: string) => message }),
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

describe('TeamsSettings', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    featureFlags.IS_CHAT_ASSISTANT_ENABLED = false;
    featureFlags.IS_TRANSCRIPT_IMPORT_ENABLED = false;
    variables[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = 'false';
    variables[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY] = 'false';
    queryMock.mockImplementation(async () => ({
      findOneApplication: {
        id: 'teams-application',
        applicationVariables: Object.entries(variables).map(([key, value]) => ({
          key,
          value,
        })),
      },
    }));
    mutationMock.mockImplementation(
      async (request: {
        updateOneApplicationVariable: {
          __args: { key: string; value: string };
        };
      }) => {
        const { key, value } = request.updateOneApplicationVariable.__args;

        variables[key] = value;

        return { updateOneApplicationVariable: true };
      },
    );
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('keeps unfinished features inactive even when workspace settings are enabled', async () => {
    variables[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';
    variables[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';
    const user = userEvent.setup();

    render(<TeamsSettings />);

    for (const label of ['Enable chat', 'Enable transcripts']) {
      const control = screen.getByRole('switch', { name: label });

      expect(control.getAttribute('aria-checked')).toBe('false');
      expect(control.hasAttribute('disabled')).toBe(true);
      await user.click(control);
    }

    expect(
      screen.getAllByText('Not available in this version yet.'),
    ).toHaveLength(2);
    expect(queryMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ])(
    'supports independent chat (%s) and transcript (%s) releases',
    async (isChatAvailable, isTranscriptsAvailable) => {
      featureFlags.IS_CHAT_ASSISTANT_ENABLED = isChatAvailable;
      featureFlags.IS_TRANSCRIPT_IMPORT_ENABLED = isTranscriptsAvailable;
      variables[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';
      variables[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';

      render(<TeamsSettings />);

      const chat = screen.getByRole('switch', { name: 'Enable chat' });
      const transcripts = screen.getByRole('switch', {
        name: 'Enable transcripts',
      });

      await waitFor(() => {
        expect(chat.hasAttribute('disabled')).toBe(!isChatAvailable);
        expect(transcripts.hasAttribute('disabled')).toBe(
          !isTranscriptsAvailable,
        );
      });
      expect(chat.getAttribute('aria-checked')).toBe(String(isChatAvailable));
      expect(transcripts.getAttribute('aria-checked')).toBe(
        String(isTranscriptsAvailable),
      );
      expect(queryMock.mock.calls).toEqual(
        Array.from(
          { length: Number(isChatAvailable) + Number(isTranscriptsAvailable) },
          () => [SETTINGS_QUERY],
        ),
      );
      expect(mutationMock).not.toHaveBeenCalled();
    },
  );

  it.each([undefined, '', 'false', 'TRUE'])(
    'keeps available features off for workspace value %s',
    async (value) => {
      featureFlags.IS_CHAT_ASSISTANT_ENABLED = true;
      featureFlags.IS_TRANSCRIPT_IMPORT_ENABLED = true;
      variables[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = value;
      variables[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY] = value;

      render(<TeamsSettings />);

      await waitFor(() => {
        for (const control of screen.getAllByRole('switch')) {
          expect(control.hasAttribute('disabled')).toBe(false);
          expect(control.getAttribute('aria-checked')).toBe('false');
        }
      });
      expect(queryMock.mock.calls).toEqual([
        [SETTINGS_QUERY],
        [SETTINGS_QUERY],
      ]);
      expect(mutationMock).not.toHaveBeenCalled();
    },
  );

  it('saves the selected feature without changing the other preference', async () => {
    featureFlags.IS_CHAT_ASSISTANT_ENABLED = true;
    featureFlags.IS_TRANSCRIPT_IMPORT_ENABLED = true;
    const user = userEvent.setup();

    render(<TeamsSettings />);

    const chat = screen.getByRole('switch', { name: 'Enable chat' });
    const transcripts = screen.getByRole('switch', {
      name: 'Enable transcripts',
    });
    await waitFor(() => {
      expect(chat.hasAttribute('disabled')).toBe(false);
      expect(transcripts.hasAttribute('disabled')).toBe(false);
    });
    expect(queryMock.mock.calls).toEqual([[SETTINGS_QUERY], [SETTINGS_QUERY]]);
    expect(mutationMock).not.toHaveBeenCalled();

    await user.click(chat);

    await waitFor(() => expect(chat.getAttribute('aria-checked')).toBe('true'));
    expect(transcripts.getAttribute('aria-checked')).toBe('false');
    expect(queryMock.mock.calls).toEqual([
      [SETTINGS_QUERY],
      [SETTINGS_QUERY],
      [APPLICATION_QUERY],
      [SETTINGS_QUERY],
    ]);
    expect(mutationMock).toHaveBeenCalledTimes(1);
    expect(mutationMock).toHaveBeenNthCalledWith(1, {
      updateOneApplicationVariable: {
        __args: {
          applicationId: 'teams-application',
          key: CHAT_ENABLED_APPLICATION_VARIABLE_KEY,
          value: 'true',
        },
      },
    });

    await user.click(transcripts);
    await waitFor(() =>
      expect(transcripts.getAttribute('aria-checked')).toBe('true'),
    );
    expect(chat.getAttribute('aria-checked')).toBe('true');
    expect(queryMock.mock.calls).toEqual([
      [SETTINGS_QUERY],
      [SETTINGS_QUERY],
      [APPLICATION_QUERY],
      [SETTINGS_QUERY],
      [APPLICATION_QUERY],
      [SETTINGS_QUERY],
    ]);
    expect(mutationMock).toHaveBeenCalledTimes(2);
    expect(mutationMock).toHaveBeenNthCalledWith(2, {
      updateOneApplicationVariable: {
        __args: {
          applicationId: 'teams-application',
          key: TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY,
          value: 'true',
        },
      },
    });

    await user.click(chat);
    await waitFor(() =>
      expect(chat.getAttribute('aria-checked')).toBe('false'),
    );
    expect(transcripts.getAttribute('aria-checked')).toBe('true');
    expect(queryMock.mock.calls).toEqual([
      [SETTINGS_QUERY],
      [SETTINGS_QUERY],
      [APPLICATION_QUERY],
      [SETTINGS_QUERY],
      [APPLICATION_QUERY],
      [SETTINGS_QUERY],
      [APPLICATION_QUERY],
      [SETTINGS_QUERY],
    ]);
    expect(mutationMock).toHaveBeenCalledTimes(3);
    expect(mutationMock).toHaveBeenNthCalledWith(3, {
      updateOneApplicationVariable: {
        __args: {
          applicationId: 'teams-application',
          key: CHAT_ENABLED_APPLICATION_VARIABLE_KEY,
          value: 'false',
        },
      },
    });
  });

  it('keeps the saved preference after a failed update and allows retry', async () => {
    featureFlags.IS_CHAT_ASSISTANT_ENABLED = true;
    mutationMock.mockRejectedValueOnce(new Error('Not allowed'));
    const user = userEvent.setup();

    render(<TeamsSettings />);

    const chat = screen.getByRole('switch', { name: 'Enable chat' });
    await waitFor(() => expect(chat.hasAttribute('disabled')).toBe(false));
    await user.click(chat);

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Could not save this setting. Please try again.',
    );
    expect(chat.getAttribute('aria-checked')).toBe('false');
    expect(queryMock.mock.calls).toEqual([
      [SETTINGS_QUERY],
      [APPLICATION_QUERY],
      [SETTINGS_QUERY],
    ]);
    expect(mutationMock).toHaveBeenCalledTimes(1);
    expect(mutationMock).toHaveBeenNthCalledWith(1, {
      updateOneApplicationVariable: {
        __args: {
          applicationId: 'teams-application',
          key: CHAT_ENABLED_APPLICATION_VARIABLE_KEY,
          value: 'true',
        },
      },
    });

    await user.click(chat);
    await waitFor(() => expect(chat.getAttribute('aria-checked')).toBe('true'));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(queryMock.mock.calls).toEqual([
      [SETTINGS_QUERY],
      [APPLICATION_QUERY],
      [SETTINGS_QUERY],
      [APPLICATION_QUERY],
      [SETTINGS_QUERY],
    ]);
    expect(mutationMock).toHaveBeenCalledTimes(2);
    expect(mutationMock).toHaveBeenNthCalledWith(2, {
      updateOneApplicationVariable: {
        __args: {
          applicationId: 'teams-application',
          key: CHAT_ENABLED_APPLICATION_VARIABLE_KEY,
          value: 'true',
        },
      },
    });
  });

  it('does not write settings if the Teams application cannot be found', async () => {
    featureFlags.IS_CHAT_ASSISTANT_ENABLED = true;
    const user = userEvent.setup();

    render(<TeamsSettings />);
    const chat = screen.getByRole('switch', { name: 'Enable chat' });
    await waitFor(() => expect(chat.hasAttribute('disabled')).toBe(false));
    queryMock.mockResolvedValueOnce({ findOneApplication: null });
    await user.click(chat);

    await screen.findByRole('alert');
    expect(queryMock.mock.calls).toEqual([
      [SETTINGS_QUERY],
      [APPLICATION_QUERY],
      [SETTINGS_QUERY],
    ]);
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('refreshes external changes while the settings page remains mounted', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    featureFlags.IS_CHAT_ASSISTANT_ENABLED = true;
    featureFlags.IS_TRANSCRIPT_IMPORT_ENABLED = true;

    render(<TeamsSettings />);
    const chat = screen.getByRole('switch', { name: 'Enable chat' });
    const transcripts = screen.getByRole('switch', {
      name: 'Enable transcripts',
    });
    await waitFor(() => expect(chat.hasAttribute('disabled')).toBe(false));

    queryMock.mockResolvedValue({
      findOneApplication: {
        applicationVariables: [
          { key: CHAT_ENABLED_APPLICATION_VARIABLE_KEY, value: 'true' },
          { key: TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY, value: 'true' },
        ],
      },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });

    expect(chat.getAttribute('aria-checked')).toBe('true');
    expect(transcripts.getAttribute('aria-checked')).toBe('true');
    expect(variables[CHAT_ENABLED_APPLICATION_VARIABLE_KEY]).toBe('false');
    expect(variables[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY]).toBe(
      'false',
    );
    expect(queryMock.mock.calls).toEqual([
      [SETTINGS_QUERY],
      [SETTINGS_QUERY],
      [SETTINGS_QUERY],
      [SETTINGS_QUERY],
    ]);
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('preserves the last known value and blocks edits until a failed refresh recovers', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    featureFlags.IS_CHAT_ASSISTANT_ENABLED = true;
    variables[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';
    const user = userEvent.setup();

    render(<TeamsSettings />);
    const chat = screen.getByRole('switch', { name: 'Enable chat' });
    await waitFor(() => expect(chat.hasAttribute('disabled')).toBe(false));
    queryMock.mockRejectedValueOnce(new Error('Offline'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });

    expect(screen.getByRole('alert')).toHaveProperty(
      'textContent',
      'Could not refresh this setting. Retrying automatically.',
    );
    expect(chat.getAttribute('aria-checked')).toBe('true');
    expect(chat.hasAttribute('disabled')).toBe(true);
    await user.click(chat);
    expect(queryMock.mock.calls).toEqual([[SETTINGS_QUERY], [SETTINGS_QUERY]]);
    expect(mutationMock).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });

    expect(chat.hasAttribute('disabled')).toBe(false);
    expect(chat.getAttribute('aria-checked')).toBe('true');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(queryMock.mock.calls).toEqual([
      [SETTINGS_QUERY],
      [SETTINGS_QUERY],
      [SETTINGS_QUERY],
    ]);
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('ignores old reads during a save and prevents duplicate writes and polling after unmount', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    featureFlags.IS_CHAT_ASSISTANT_ENABLED = true;
    const user = userEvent.setup();
    const { unmount } = render(<TeamsSettings />);
    const chat = screen.getByRole('switch', { name: 'Enable chat' });
    await waitFor(() => expect(chat.hasAttribute('disabled')).toBe(false));
    let resolveRefresh: ((response: unknown) => void) | undefined;
    const pendingRefresh = new Promise((resolve) => {
      resolveRefresh = resolve;
    });
    let resolveSave: ((response: unknown) => void) | undefined;
    const pendingSave = new Promise((resolve) => {
      resolveSave = resolve;
    });

    queryMock.mockReturnValueOnce(pendingRefresh);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });
    expect(queryMock.mock.calls).toEqual([[SETTINGS_QUERY], [SETTINGS_QUERY]]);
    mutationMock.mockReturnValueOnce(pendingSave);
    await user.click(chat);
    expect(chat.hasAttribute('disabled')).toBe(true);
    await user.click(chat);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });
    expect(queryMock.mock.calls).toEqual([
      [SETTINGS_QUERY],
      [SETTINGS_QUERY],
      [APPLICATION_QUERY],
    ]);
    expect(mutationMock).toHaveBeenCalledTimes(1);
    expect(mutationMock).toHaveBeenCalledWith({
      updateOneApplicationVariable: {
        __args: {
          applicationId: 'teams-application',
          key: CHAT_ENABLED_APPLICATION_VARIABLE_KEY,
          value: 'true',
        },
      },
    });

    variables[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';
    await act(async () => {
      resolveSave?.({ updateOneApplicationVariable: true });
    });
    expect(chat.getAttribute('aria-checked')).toBe('true');
    expect(chat.hasAttribute('disabled')).toBe(false);
    await act(async () => {
      resolveRefresh?.({
        findOneApplication: {
          applicationVariables: [
            { key: CHAT_ENABLED_APPLICATION_VARIABLE_KEY, value: 'false' },
          ],
        },
      });
    });
    expect(chat.getAttribute('aria-checked')).toBe('true');
    unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(queryMock.mock.calls).toEqual([
      [SETTINGS_QUERY],
      [SETTINGS_QUERY],
      [APPLICATION_QUERY],
      [SETTINGS_QUERY],
    ]);
    expect(mutationMock).toHaveBeenCalledTimes(1);
  });
});
