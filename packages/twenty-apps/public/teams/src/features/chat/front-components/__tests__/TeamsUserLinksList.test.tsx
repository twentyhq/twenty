// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TeamsUserLinksList } from 'src/features/chat/front-components/TeamsUserLinksList';

const { restGetMock, restPostMock, enqueueSnackbarMock } = vi.hoisted(() => ({
  restGetMock: vi.fn(),
  restPostMock: vi.fn(),
  enqueueSnackbarMock: vi.fn(),
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

describe('TeamsUserLinksList', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(cleanup);

  it('lists linked Teams accounts across pages sorted by name with their member and known source', async () => {
    restGetMock
      .mockResolvedValueOnce({
        data: {
          teamsUserLinks: [
            {
              id: 'link-2',
              name: 'Zoe Teams',
              source: 'MANUAL',
              workspaceMember: { name: { firstName: 'Zoe', lastName: 'Doe' } },
            },
            { id: null, name: 'Ignored' },
          ],
        },
        pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
      })
      .mockResolvedValueOnce({
        data: {
          teamsUserLinks: [
            {
              id: 'link-1',
              name: 'Adam Teams',
              source: 'AUTO',
              workspaceMember: { name: { firstName: 'Adam', lastName: '' } },
            },
            {
              id: 'link-3',
              name: 'Mia Teams',
              source: 'LEGACY',
              workspaceMember: null,
            },
          ],
        },
        pageInfo: { hasNextPage: false, endCursor: 'cursor-2' },
      });

    render(<TeamsUserLinksList />);

    const rows = await screen.findAllByRole('listitem');

    expect(rows.map((row) => row.textContent)).toEqual([
      'Adam TeamsAdamMatched on emailRemove',
      'Mia TeamsNo workspace memberRemove',
      'Zoe TeamsZoe DoeSet manuallyRemove',
    ]);
    expect(restGetMock.mock.calls).toEqual([
      ['/rest/teamsUserLinks', { query: { depth: '1', limit: '200' } }],
      [
        '/rest/teamsUserLinks',
        {
          query: { depth: '1', limit: '200', starting_after: 'cursor-1' },
        },
      ],
    ]);
  });

  it('shows an error when links cannot be loaded', async () => {
    restGetMock.mockRejectedValue(new Error('Forbidden'));

    render(<TeamsUserLinksList />);

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Could not load linked Teams accounts. Please try again.',
    );
  });

  it('removes a link through the route and drops it from the list', async () => {
    restGetMock.mockResolvedValue({
      data: {
        teamsUserLinks: [
          { id: 'link-1', name: 'Adam Teams', source: 'AUTO' },
          { id: 'link-2', name: 'Zoe Teams', source: 'MANUAL' },
        ],
      },
    });
    restPostMock.mockResolvedValue({
      success: true,
      message: 'Removed the Teams user link.',
    });
    const user = userEvent.setup();

    render(<TeamsUserLinksList />);
    await user.click(
      await screen.findByRole('button', { name: 'Remove link for Adam Teams' }),
    );

    expect(restPostMock).toHaveBeenCalledWith('/s/teams-user-links/remove', {
      id: 'link-1',
    });
    expect(enqueueSnackbarMock).toHaveBeenCalledWith({
      message: 'Removed the Teams user link.',
      variant: 'success',
    });
    expect(screen.queryByText('Adam Teams')).toBeNull();
    expect(screen.getByText('Zoe Teams')).toBeTruthy();
  });

  it('keeps the link and shows the reason when removal is refused', async () => {
    restGetMock.mockResolvedValue({
      data: {
        teamsUserLinks: [{ id: 'link-1', name: 'Adam Teams', source: 'AUTO' }],
      },
    });
    restPostMock.mockResolvedValue({
      success: false,
      message: 'Not allowed',
      error:
        'Only members with the roles permission can remove Teams user links.',
    });
    const user = userEvent.setup();

    render(<TeamsUserLinksList />);
    await user.click(
      await screen.findByRole('button', { name: 'Remove link for Adam Teams' }),
    );

    expect(enqueueSnackbarMock).toHaveBeenCalledWith({
      message:
        'Only members with the roles permission can remove Teams user links.',
      variant: 'error',
    });
    expect(screen.getByText('Adam Teams')).toBeTruthy();
  });
});
