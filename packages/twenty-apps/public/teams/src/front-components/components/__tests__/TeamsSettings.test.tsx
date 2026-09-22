// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { TeamsSettings } from 'src/front-components/components/TeamsSettings';

const { featureFlags, variables, queryMock, mutationMock } = vi.hoisted(() => ({
  featureFlags: {
    IS_CHAT_ASSISTANT_ENABLED: false,
    IS_TRANSCRIPT_IMPORT_ENABLED: false,
  },
  variables: {} as Record<string, string | undefined>,
  queryMock: vi.fn(),
  mutationMock: vi.fn(),
}));

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
    vi.clearAllMocks();
    featureFlags.IS_CHAT_ASSISTANT_ENABLED = false;
    featureFlags.IS_TRANSCRIPT_IMPORT_ENABLED = false;
    variables[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = 'false';
    variables[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY] = 'false';
    queryMock.mockResolvedValue({
      findOneApplication: { id: 'teams-application' },
    });
    mutationMock.mockResolvedValue({ updateOneApplicationVariable: true });
  });

  afterEach(cleanup);

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
    (chatAvailable, transcriptsAvailable) => {
      featureFlags.IS_CHAT_ASSISTANT_ENABLED = chatAvailable;
      featureFlags.IS_TRANSCRIPT_IMPORT_ENABLED = transcriptsAvailable;
      variables[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';
      variables[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';

      render(<TeamsSettings />);

      const chat = screen.getByRole('switch', { name: 'Enable chat' });
      const transcripts = screen.getByRole('switch', {
        name: 'Enable transcripts',
      });

      expect(chat.getAttribute('aria-checked')).toBe(String(chatAvailable));
      expect(chat.hasAttribute('disabled')).toBe(!chatAvailable);
      expect(transcripts.getAttribute('aria-checked')).toBe(
        String(transcriptsAvailable),
      );
      expect(transcripts.hasAttribute('disabled')).toBe(!transcriptsAvailable);
    },
  );

  it.each([undefined, '', 'false', 'TRUE'])(
    'keeps available features off for workspace value %s',
    (value) => {
      featureFlags.IS_CHAT_ASSISTANT_ENABLED = true;
      featureFlags.IS_TRANSCRIPT_IMPORT_ENABLED = true;
      variables[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = value;
      variables[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY] = value;

      render(<TeamsSettings />);

      for (const control of screen.getAllByRole('switch')) {
        expect(control.getAttribute('aria-checked')).toBe('false');
      }
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
    await user.click(chat);

    await waitFor(() => expect(chat.getAttribute('aria-checked')).toBe('true'));
    expect(transcripts.getAttribute('aria-checked')).toBe('false');
    expect(queryMock).toHaveBeenCalledWith({
      findOneApplication: {
        __args: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
        id: true,
      },
    });
    expect(mutationMock).toHaveBeenLastCalledWith({
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
    expect(mutationMock).toHaveBeenLastCalledWith({
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
  });

  it('keeps the saved preference after a failed update and allows retry', async () => {
    featureFlags.IS_CHAT_ASSISTANT_ENABLED = true;
    mutationMock.mockRejectedValueOnce(new Error('Not allowed'));
    const user = userEvent.setup();

    render(<TeamsSettings />);

    const chat = screen.getByRole('switch', { name: 'Enable chat' });
    await user.click(chat);

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Could not save this setting. Please try again.',
    );
    expect(chat.getAttribute('aria-checked')).toBe('false');

    await user.click(chat);
    await waitFor(() => expect(chat.getAttribute('aria-checked')).toBe('true'));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('does not write settings if the Teams application cannot be found', async () => {
    featureFlags.IS_CHAT_ASSISTANT_ENABLED = true;
    queryMock.mockResolvedValueOnce({ findOneApplication: null });
    const user = userEvent.setup();

    render(<TeamsSettings />);
    await user.click(screen.getByRole('switch', { name: 'Enable chat' }));

    await screen.findByRole('alert');
    expect(mutationMock).not.toHaveBeenCalled();
  });
});
