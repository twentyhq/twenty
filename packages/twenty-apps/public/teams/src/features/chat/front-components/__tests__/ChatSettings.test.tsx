// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { ChatSettings } from 'src/features/chat/front-components/ChatSettings';

const {
  releaseFlags,
  variables,
  queryMock,
  mutationMock,
  restPostMock,
  enqueueSnackbarMock,
} = vi.hoisted(() => {
  const variables: Record<string, string | undefined> = {};

  return {
    releaseFlags: { IS_CHAT_ASSISTANT_RELEASED: true },
    variables,
    queryMock: vi.fn(),
    mutationMock: vi.fn(),
    restPostMock: vi.fn(),
    enqueueSnackbarMock: vi.fn(),
  };
});

vi.mock('src/constants/release-flags', () => ({
  RELEASE_FLAGS: releaseFlags,
}));

vi.mock('twenty-sdk/front-component', () => ({
  enqueueSnackbar: enqueueSnackbarMock,
  getApplicationVariable: (key: string) => variables[key],
  useTranslate: () => ({ t: (message: string) => message }),
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

vi.mock('twenty-client-sdk/rest', () => ({
  RestApiClient: class {
    post = restPostMock;
  },
}));

vi.mock('src/features/chat/front-components/TeamsUserLinksSettings', () => ({
  TeamsUserLinksSettings: () => <p>Teams user links</p>,
}));

const RECONCILE_ROUTE = '/s/teams-chat/reconcile';

const getChatSwitch = () => screen.getByRole('switch', { name: 'Enable chat' });

describe('ChatSettings', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = true;
    variables[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = 'false';
    queryMock.mockResolvedValue({
      findOneApplication: { id: 'teams-application' },
    });
    mutationMock.mockResolvedValue({ updateOneApplicationVariable: true });
    restPostMock.mockResolvedValue({
      success: true,
      connections: [
        {
          connectedAccountId: 'workspace-connection',
          status: 'CLAIMED',
          tenantId: 'tenant-id',
        },
      ],
    });
  });

  afterEach(cleanup);

  it.each([
    ['registers', 'false', true],
    ['releases', 'true', false],
  ])(
    '%s the Microsoft organization once chat is saved',
    async (_, savedValue, isEnabled) => {
      variables[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = savedValue;
      const user = userEvent.setup();

      render(<ChatSettings />);
      await user.click(getChatSwitch());

      await waitFor(() =>
        expect(restPostMock).toHaveBeenCalledExactlyOnceWith(RECONCILE_ROUTE, {
          isEnabled,
        }),
      );
      expect(mutationMock.mock.invocationCallOrder[0]).toBeLessThan(
        restPostMock.mock.invocationCallOrder[0],
      );
      expect(enqueueSnackbarMock).not.toHaveBeenCalled();
    },
  );

  it('leaves Teams alone when the setting could not be saved', async () => {
    mutationMock.mockRejectedValue(new Error('Not allowed'));
    const user = userEvent.setup();

    render(<ChatSettings />);
    await user.click(getChatSwitch());

    await screen.findByRole('alert');
    expect(restPostMock).not.toHaveBeenCalled();
  });

  it('tells the admin when another workspace holds the Microsoft organization', async () => {
    restPostMock.mockResolvedValue({
      success: true,
      connections: [
        {
          connectedAccountId: 'workspace-connection',
          status: 'CONFLICT',
          tenantId: 'tenant-id',
        },
      ],
    });
    const user = userEvent.setup();

    render(<ChatSettings />);
    await user.click(getChatSwitch());

    await waitFor(() =>
      expect(enqueueSnackbarMock).toHaveBeenCalledExactlyOnceWith({
        message:
          'Another workspace already uses chat for this Microsoft organization.',
        variant: 'error',
      }),
    );
  });
});
