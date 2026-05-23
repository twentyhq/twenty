import { useQuery } from '@apollo/client/react';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useEmailComposerState } from '@/activities/emails/hooks/useEmailComposerState';

const mockUseQuery = useQuery as unknown as jest.Mock;
const mockSendEmail = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useQuery: jest.fn(),
}));

jest.mock('@/activities/emails/hooks/useSendEmail', () => ({
  useSendEmail: () => ({
    sendEmail: mockSendEmail,
    loading: false,
  }),
}));

describe('useEmailComposerState', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseQuery.mockReturnValue({
      data: {
        myConnectedAccounts: [
          {
            id: 'account-a',
            emailSignature: '<p>Jane Doe</p>',
          },
          {
            id: 'account-b',
            emailSignature: '<p>John Smith</p>',
          },
        ],
      },
      loading: false,
    });
  });

  it('updates the signature when the connected account changes after body edits', async () => {
    const { result } = renderHook(() =>
      useEmailComposerState({
        connectedAccountId: 'account-a',
      }),
    );

    await waitFor(() =>
      expect(result.current.body).toBe('<p></p><p>Jane Doe</p>'),
    );

    act(() => {
      result.current.setBody('<p>Hello</p><p>Jane Doe</p>');
    });

    act(() => {
      result.current.setConnectedAccountId('account-b');
    });

    await waitFor(() =>
      expect(result.current.body).toBe('<p>Hello</p><p></p><p>John Smith</p>'),
    );
  });
});
