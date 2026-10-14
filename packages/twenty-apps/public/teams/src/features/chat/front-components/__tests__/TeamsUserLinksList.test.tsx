// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TeamsUserLinksList } from 'src/features/chat/front-components/TeamsUserLinksList';

const { restGetMock } = vi.hoisted(() => ({ restGetMock: vi.fn() }));

vi.mock('twenty-sdk/front-component', () => ({
  useTranslate: () => ({ t: (message: string) => message }),
}));

vi.mock('twenty-client-sdk/rest', () => ({
  RestApiClient: class {
    get = restGetMock;
  },
}));

describe('TeamsUserLinksList', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(cleanup);

  it('lists linked Teams accounts sorted by name with their member and source', async () => {
    restGetMock.mockResolvedValue({
      data: {
        teamsUserLinks: [
          {
            id: 'link-2',
            name: 'Zoe Teams',
            source: 'MANUAL',
            workspaceMember: { name: { firstName: 'Zoe', lastName: 'Doe' } },
          },
          { id: null, name: 'Ignored' },
          {
            id: 'link-1',
            name: 'Adam Teams',
            source: 'AUTO',
            workspaceMember: { name: { firstName: 'Adam', lastName: '' } },
          },
        ],
      },
    });

    render(<TeamsUserLinksList />);

    const rows = await screen.findAllByRole('listitem');

    expect(rows.map((row) => row.textContent)).toEqual([
      'Adam TeamsAdamMatched on email',
      'Zoe TeamsZoe DoeSet manually',
    ]);
    expect(restGetMock).toHaveBeenCalledWith('/rest/teamsUserLinks', {
      query: { depth: '1', limit: '200' },
    });
  });

  it('shows an empty state when no account is linked', async () => {
    restGetMock.mockResolvedValue({ data: { teamsUserLinks: [] } });

    render(<TeamsUserLinksList />);

    expect(
      await screen.findByText('No Teams account is linked yet.'),
    ).toBeTruthy();
  });

  it('shows an error when links cannot be loaded', async () => {
    restGetMock.mockRejectedValue(new Error('Forbidden'));

    render(<TeamsUserLinksList />);

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Could not load linked Teams accounts. Please try again.',
    );
  });
});
