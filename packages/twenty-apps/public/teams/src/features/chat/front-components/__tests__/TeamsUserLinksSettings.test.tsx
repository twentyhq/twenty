// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TeamsUserLinksSettings } from 'src/features/chat/front-components/TeamsUserLinksSettings';

const {
  restGetMock,
  restPostMock,
  enqueueSnackbarMock,
  hasRolesPermissionMock,
} = vi.hoisted(() => ({
  restGetMock: vi.fn(),
  restPostMock: vi.fn(),
  enqueueSnackbarMock: vi.fn(),
  hasRolesPermissionMock: vi.fn(),
}));

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

vi.mock(
  'src/features/chat/logic-functions/utils/current-user-has-roles-permission',
  () => ({ currentUserHasRolesPermission: hasRolesPermissionMock }),
);

const setRestResponses = ({
  unlinkedTeamsUsers = [] as unknown[],
  workspaceMembers = [] as unknown[],
}: {
  unlinkedTeamsUsers?: unknown[];
  workspaceMembers?: unknown[];
} = {}) => {
  restGetMock.mockImplementation((path: string) => {
    if (path === '/rest/teamsUserLinks') {
      return Promise.resolve({ data: { teamsUserLinks: [] } });
    }

    if (path === '/rest/workspaceMembers') {
      return Promise.resolve({ data: { workspaceMembers } });
    }

    return Promise.resolve({});
  });

  restPostMock.mockImplementation((path: string) => {
    if (path === '/s/teams-user-links/unlinked') {
      return Promise.resolve({
        success: true,
        teamsUsers: unlinkedTeamsUsers,
        hasMore: false,
      });
    }

    if (path === '/s/teams-user-links/set') {
      return Promise.resolve({ success: true, message: 'Linked' });
    }

    return Promise.resolve({ success: true });
  });
};

describe('TeamsUserLinksSettings', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    hasRolesPermissionMock.mockResolvedValue(true);
    setRestResponses();
  });

  afterEach(cleanup);

  it('warns a member without the roles permission and hides the management controls', async () => {
    hasRolesPermissionMock.mockResolvedValue(false);

    render(<TeamsUserLinksSettings />);

    expect(
      await screen.findByText('You need the roles permission'),
    ).toBeTruthy();
    expect(screen.queryByText('Unlinked Teams users')).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Link someone not listed above' }),
    ).toBeNull();
    expect(
      restPostMock.mock.calls.some(
        (call) => call[0] === '/s/teams-user-links/unlinked',
      ),
    ).toBe(false);
  });

  it('lists unlinked directory users and exposes the manual link form for an admin', async () => {
    setRestResponses({
      unlinkedTeamsUsers: [
        {
          teamsUserAadObjectId: 'aad-bob',
          displayName: 'Bob Builder',
          email: 'bob@twenty.com',
        },
      ],
    });

    render(<TeamsUserLinksSettings />);

    expect(await screen.findByText('Bob Builder')).toBeTruthy();
    expect(screen.getByText('Unlinked Teams users')).toBeTruthy();

    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', { name: 'Link someone not listed above' }),
    );

    expect(await screen.findByText('Link a Teams user')).toBeTruthy();
  });

  it('links an unlinked user to a chosen workspace member through the set route', async () => {
    setRestResponses({
      unlinkedTeamsUsers: [
        {
          teamsUserAadObjectId: 'aad-bob',
          displayName: 'Bob Builder',
          email: 'bob@twenty.com',
        },
      ],
      workspaceMembers: [
        {
          id: 'member-1',
          name: { firstName: 'Ada', lastName: 'Lovelace' },
          userEmail: 'ada@twenty.com',
        },
      ],
    });

    render(<TeamsUserLinksSettings />);

    await screen.findByText('Bob Builder');

    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', { name: 'Select the workspace member' }),
    );
    await user.click(await screen.findByText('Ada Lovelace'));
    await user.click(screen.getByRole('button', { name: 'Link' }));

    const setCall = restPostMock.mock.calls.find(
      (call) => call[0] === '/s/teams-user-links/set',
    );

    expect(setCall?.[1]).toEqual({
      workspaceMemberId: 'member-1',
      teamsUserAadObjectId: 'aad-bob',
      name: 'Bob Builder',
    });
    expect(enqueueSnackbarMock).toHaveBeenCalledWith({
      message: 'Linked',
      variant: 'success',
    });
  });
});
