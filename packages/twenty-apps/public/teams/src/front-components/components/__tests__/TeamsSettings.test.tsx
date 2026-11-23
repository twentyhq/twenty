// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { TRANSCRIPT_SUMMARY_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcript-summary-enabled-application-variable-key';
import { TeamsSettings } from 'src/front-components/components/TeamsSettings';

const { releaseFlags, variables, queryMock, mutationMock, restGetMock } =
  vi.hoisted(() => {
    const variables: Record<string, string | undefined> = {};

    return {
      releaseFlags: {
        IS_CHAT_ASSISTANT_RELEASED: false,
        IS_TRANSCRIPT_HISTORY_IMPORT_RELEASED: false,
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

vi.mock('src/constants/release-flags', () => ({
  RELEASE_FLAGS: releaseFlags,
}));

vi.mock('twenty-sdk/front-component', () => ({
  getApplicationVariable: (key: string) => variables[key],
  useTranslate: () => ({ t: (message: string) => message }),
}));

vi.mock(
  'src/features/transcripts/front-components/TranscriptImportHistorySection',
  () => ({ TranscriptImportHistorySection: () => <p>Import history</p> }),
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
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = false;
    releaseFlags.IS_TRANSCRIPT_HISTORY_IMPORT_RELEASED = false;
    variables[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = 'false';
    variables[TRANSCRIPT_SUMMARY_ENABLED_APPLICATION_VARIABLE_KEY] = 'false';
    queryMock.mockResolvedValue({
      findOneApplication: { id: 'teams-application' },
    });
    mutationMock.mockResolvedValue({ updateOneApplicationVariable: true });
    restGetMock.mockResolvedValue({ data: { teamsUserLinks: [] } });
  });

  afterEach(cleanup);

  it('hides chat before its release and keeps transcript summaries available', async () => {
    variables[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';
    variables[TRANSCRIPT_SUMMARY_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';

    render(<TeamsSettings />);

    expect(screen.queryByRole('switch', { name: 'Enable chat' })).toBeNull();

    const summaries = screen.getByRole('switch', {
      name: 'Enable transcript summaries',
    });

    expect(summaries.getAttribute('aria-checked')).toBe('true');
    expect(summaries.hasAttribute('disabled')).toBe(false);
    expect(screen.queryByText('Not available in this version yet.')).toBeNull();
    expect(queryMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    'shows Import history only when history import is released (%s)',
    (isHistoryImportAvailable) => {
      releaseFlags.IS_TRANSCRIPT_HISTORY_IMPORT_RELEASED =
        isHistoryImportAvailable;

      render(<TeamsSettings />);

      expect(screen.queryByText('Import history') !== null).toBe(
        isHistoryImportAvailable,
      );
    },
  );

  it.each([undefined, '', 'false', 'TRUE'])(
    'keeps available features off for workspace value %s',
    (value) => {
      releaseFlags.IS_CHAT_ASSISTANT_RELEASED = true;
      variables[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = value;
      variables[TRANSCRIPT_SUMMARY_ENABLED_APPLICATION_VARIABLE_KEY] = value;

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
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = true;
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
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = true;
    const user = userEvent.setup();

    render(<TeamsSettings />);

    const chat = screen.getByRole('switch', { name: 'Enable chat' });
    const summaries = screen.getByRole('switch', {
      name: 'Enable transcript summaries',
    });
    expect(queryMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();

    await user.click(chat);

    await waitFor(() => expect(chat.getAttribute('aria-checked')).toBe('true'));
    expect(summaries.getAttribute('aria-checked')).toBe('false');
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

    await user.click(summaries);
    await waitFor(() =>
      expect(summaries.getAttribute('aria-checked')).toBe('true'),
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
          key: TRANSCRIPT_SUMMARY_ENABLED_APPLICATION_VARIABLE_KEY,
          value: 'true',
        },
      },
    });

    await user.click(chat);
    await waitFor(() =>
      expect(chat.getAttribute('aria-checked')).toBe('false'),
    );
    expect(summaries.getAttribute('aria-checked')).toBe('true');
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
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = true;
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
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = true;
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
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = true;
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
