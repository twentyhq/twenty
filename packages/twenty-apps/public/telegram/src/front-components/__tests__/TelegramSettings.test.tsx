// @vitest-environment jsdom

import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TelegramSettings } from 'src/front-components/components/TelegramSettings';
import { TELEGRAM_LINK_TOKEN_TTL_MS } from 'src/logic-functions/constants/telegram-link-token-ttl-ms';

const {
  restGetMock,
  restPostMock,
  enqueueSnackbarMock,
  hasRolesPermissionMock,
  currentWorkspaceMemberIdMock,
} = vi.hoisted(() => ({
  restGetMock: vi.fn(),
  restPostMock: vi.fn(),
  enqueueSnackbarMock: vi.fn(),
  hasRolesPermissionMock: vi.fn(),
  currentWorkspaceMemberIdMock: vi.fn(),
}));

vi.mock('twenty-ui/style.css', () => ({}));
vi.mock('twenty-ui/theme-dark.css', () => ({}));
vi.mock('twenty-ui/theme-light.css', () => ({}));

vi.mock('twenty-sdk/front-component', () => ({
  enqueueSnackbar: enqueueSnackbarMock,
  useTranslate: () => ({
    t: (message: string, values?: Record<string, string>) =>
      message.replace(/\{(\w+)\}/g, (_, key: string) => values?.[key] ?? ''),
  }),
}));

vi.mock('twenty-client-sdk/rest', () => ({
  RestApiClient: class {
    get = restGetMock;
    post = restPostMock;
  },
}));

vi.mock('src/logic-functions/utils/current-user-has-roles-permission', () => ({
  currentUserHasRolesPermission: hasRolesPermissionMock,
}));

vi.mock('src/front-components/utils/fetch-current-workspace-member-id', () => ({
  fetchCurrentWorkspaceMemberId: currentWorkspaceMemberIdMock,
}));

const LINKS = [
  {
    id: 'link-2',
    name: 'Zoe Doe',
    telegramUsername: '',
    workspaceMemberId: 'member-2',
    workspaceMember: { name: { firstName: 'Zoe', lastName: 'Doe' } },
  },
  {
    id: 'link-1',
    name: 'Ada Lovelace',
    telegramUsername: 'ada',
    workspaceMemberId: 'member-1',
    workspaceMember: { name: { firstName: 'Ada', lastName: 'L' } },
  },
];

describe('TelegramSettings', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    restGetMock.mockResolvedValue({ data: { telegramUserLinks: LINKS } });
    hasRolesPermissionMock.mockResolvedValue(false);
    currentWorkspaceMemberIdMock.mockResolvedValue('member-1');
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('shows the link to Telegram once a connection is started', async () => {
    restPostMock.mockResolvedValue({
      success: true,
      url: 'https://t.me/TwentyBot?start=token',
      botUsername: 'TwentyBot',
      startCommand: '/start token',
      expiresAt: '2026-11-24T10:10:00.000Z',
    });
    const user = userEvent.setup();

    render(<TelegramSettings />);
    await user.click(screen.getByRole('button', { name: 'Connect Telegram' }));

    expect(
      await screen.findByRole('link', {
        name: 'Open Telegram to finish connecting',
      }),
    ).toHaveProperty('href', 'https://t.me/TwentyBot?start=token');
    expect(
      screen.getByTitle('QR code that opens the Telegram bot'),
    ).toBeTruthy();
    expect(
      screen.getByText('Or send this message to @TwentyBot:'),
    ).toBeTruthy();
    expect(screen.getByText('/start token')).toBeTruthy();
    expect(restPostMock.mock.calls).toEqual([
      ['/s/telegram/user-links/start', {}],
    ]);
  });

  it('replaces the link with a new connection button once it expires', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    restPostMock.mockResolvedValue({
      success: true,
      url: 'https://t.me/TwentyBot?start=token',
      botUsername: 'TwentyBot',
      startCommand: '/start token',
      expiresAt: '2026-11-24T10:10:00.000Z',
    });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<TelegramSettings />);
    await user.click(screen.getByRole('button', { name: 'Connect Telegram' }));
    await screen.findByText('/start token');

    await act(() => vi.advanceTimersByTimeAsync(TELEGRAM_LINK_TOKEN_TTL_MS));

    expect(
      screen.getByText('This link has expired. Start a new connection.'),
    ).toBeTruthy();
    expect(screen.queryByText('/start token')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Connect Telegram' }),
    ).toBeTruthy();
  });

  it('shows why a connection could not be started and lets the member retry', async () => {
    restPostMock.mockResolvedValue({
      success: false,
      message: 'Telegram is not configured',
      error: 'TELEGRAM_BOT_TOKEN must be set',
    });
    const user = userEvent.setup();

    render(<TelegramSettings />);
    await user.click(screen.getByRole('button', { name: 'Connect Telegram' }));

    expect(await screen.findByText('Telegram is not configured')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Connect Telegram' }),
    ).toBeTruthy();
  });

  it('lists connected accounts by name and lets a member disconnect only their own', async () => {
    render(<TelegramSettings />);

    const rows = await screen.findAllByRole('listitem');

    expect(rows.map((row) => row.textContent)).toEqual([
      'Ada Lovelace@adaAda LDisconnect',
      'Zoe DoeZoe Doe',
    ]);
  });

  it('disconnects an account through the route and drops it from the list', async () => {
    restPostMock.mockResolvedValue({ success: true, message: 'Disconnected' });
    const user = userEvent.setup();

    render(<TelegramSettings />);
    await user.click(
      await screen.findByRole('button', { name: 'Disconnect Ada Lovelace' }),
    );

    expect(restPostMock.mock.calls).toEqual([
      ['/s/telegram/user-links/remove', { id: 'link-1' }],
    ]);
    expect(enqueueSnackbarMock.mock.calls).toEqual([
      [{ message: 'Account disconnected', variant: 'success' }],
    ]);
    expect(
      (await screen.findAllByRole('listitem')).map((row) => row.textContent),
    ).toEqual(['Zoe DoeZoe Doe']);
  });

  it('shows an error when connected accounts cannot be loaded', async () => {
    restGetMock.mockRejectedValue(new Error('Forbidden'));

    render(<TelegramSettings />);

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Could not load connected Telegram accounts. Please try again.',
    );
  });
});
