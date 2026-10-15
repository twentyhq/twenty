// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { TeamsSettings } from 'src/front-components/components/TeamsSettings';

const { featureFlags, variables, queryMock, mutationMock, restGetMock } =
  vi.hoisted(() => {
    const variables: Record<string, string | undefined> = {};

    return {
      featureFlags: {
        IS_CHAT_ASSISTANT_ENABLED: false,
        IS_TRANSCRIPT_IMPORT_ENABLED: false,
      },
      variables,
      queryMock: vi.fn(),
      mutationMock: vi.fn(),
      restGetMock: vi.fn(),
    };
  });

const APPLICATION_QUERY = {
  findOneApplication: {
    __args: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
    id: true,
  },
};

vi.mock('src/constants/feature-flags', () => ({
  FEATURE_FLAGS: featureFlags,
}));

vi.mock('twenty-sdk/front-component', () => ({
  getApplicationVariable: (key: string) => variables[key],
  useTranslate: () => ({ t: (message: string) => message }),
}));

vi.mock(
  'src/features/transcripts/front-components/TranscriptImportHistorySection',
  () => ({ TranscriptImportHistorySection: () => null }),
);

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

vi.mock('twenty-client-sdk/rest', () => ({
  RestApiClient: class {
    get = restGetMock;
  },
}));

vi.mock(
  'src/features/chat/logic-functions/utils/current-user-has-roles-permission',
  () => ({ currentUserHasRolesPermission: async () => false }),
);

describe('TeamsSettings', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    featureFlags.IS_CHAT_ASSISTANT_ENABLED = false;
    featureFlags.IS_TRANSCRIPT_IMPORT_ENABLED = false;
    variables[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = 'false';
    variables[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY] = 'false';
    queryMock.mockResolvedValue({
      findOneApplication: { id: 'teams-application' },
    });
    mutationMock.mockResolvedValue({ updateOneApplicationVariable: true });
    restGetMock.mockResolvedValue({ data: { teamsUserLinks: [] } });
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
    (isChatAvailable, isTranscriptsAvailable) => {
      featureFlags.IS_CHAT_ASSISTANT_ENABLED = isChatAvailable;
      featureFlags.IS_TRANSCRIPT_IMPORT_ENABLED = isTranscriptsAvailable;
      variables[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';
      variables[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';

      render(<TeamsSettings />);

      const chat = screen.getByRole('switch', { name: 'Enable chat' });
      const transcripts = screen.getByRole('switch', {
        name: 'Enable transcripts',
      });

      expect(chat.hasAttribute('disabled')).toBe(!isChatAvailable);
      expect(transcripts.hasAttribute('disabled')).toBe(
        !isTranscriptsAvailable,
      );
      expect(chat.getAttribute('aria-checked')).toBe(String(isChatAvailable));
      expect(transcripts.getAttribute('aria-checked')).toBe(
        String(isTranscriptsAvailable),
      );
      expect(queryMock).not.toHaveBeenCalled();
      expect(mutationMock).not.toHaveBeenCalled();
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
        expect(control.hasAttribute('disabled')).toBe(false);
        expect(control.getAttribute('aria-checked')).toBe('false');
      }
      expect(queryMock).not.toHaveBeenCalled();
      expect(mutationMock).not.toHaveBeenCalled();
    },
  );

  it('shows linked Teams accounts only while chat is enabled', async () => {
    featureFlags.IS_CHAT_ASSISTANT_ENABLED = true;
    const user = userEvent.setup();

    render(<TeamsSettings />);

    expect(screen.queryByText('Linked Teams accounts')).toBeNull();

    await user.click(screen.getByRole('switch', { name: 'Enable chat' }));

    expect(
      await screen.findByText('No Teams account is linked yet.'),
    ).toBeTruthy();
    expect(restGetMock).toHaveBeenCalledTimes(1);
  });

  it('saves the selected feature without changing the other preference', async () => {
    featureFlags.IS_CHAT_ASSISTANT_ENABLED = true;
    featureFlags.IS_TRANSCRIPT_IMPORT_ENABLED = true;
    const user = userEvent.setup();

    render(<TeamsSettings />);

    const chat = screen.getByRole('switch', { name: 'Enable chat' });
    const transcripts = screen.getByRole('switch', {
      name: 'Enable transcripts',
    });
    expect(queryMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();

    await user.click(chat);

    await waitFor(() => expect(chat.getAttribute('aria-checked')).toBe('true'));
    expect(transcripts.getAttribute('aria-checked')).toBe('false');
    expect(queryMock.mock.calls).toEqual([[APPLICATION_QUERY]]);
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
      [APPLICATION_QUERY],
      [APPLICATION_QUERY],
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
      [APPLICATION_QUERY],
      [APPLICATION_QUERY],
      [APPLICATION_QUERY],
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
    await user.click(chat);

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Could not save this setting. Please try again.',
    );
    expect(chat.getAttribute('aria-checked')).toBe('false');
    expect(queryMock.mock.calls).toEqual([[APPLICATION_QUERY]]);
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
      [APPLICATION_QUERY],
      [APPLICATION_QUERY],
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
    queryMock.mockResolvedValueOnce({ findOneApplication: null });
    await user.click(chat);

    await screen.findByRole('alert');
    expect(queryMock.mock.calls).toEqual([[APPLICATION_QUERY]]);
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('disables the selected setting while saving and prevents duplicate writes', async () => {
    featureFlags.IS_CHAT_ASSISTANT_ENABLED = true;
    const user = userEvent.setup();
    let resolveSave: ((response: unknown) => void) | undefined;
    const pendingSave = new Promise((resolve) => {
      resolveSave = resolve;
    });
    mutationMock.mockReturnValueOnce(pendingSave);

    render(<TeamsSettings />);
    const chat = screen.getByRole('switch', { name: 'Enable chat' });
    await user.click(chat);

    expect(chat.hasAttribute('disabled')).toBe(true);
    expect(chat.getAttribute('aria-checked')).toBe('false');
    await user.click(chat);

    expect(queryMock.mock.calls).toEqual([[APPLICATION_QUERY]]);
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

    await act(async () => {
      resolveSave?.({ updateOneApplicationVariable: true });
    });
    expect(chat.getAttribute('aria-checked')).toBe('true');
    expect(chat.hasAttribute('disabled')).toBe(false);
    expect(queryMock.mock.calls).toEqual([[APPLICATION_QUERY]]);
    expect(mutationMock).toHaveBeenCalledTimes(1);
  });
});
