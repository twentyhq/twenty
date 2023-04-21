import { render, waitFor } from '@testing-library/react';
import { useRefreshToken } from '../useRefreshToken';

function TestComponent() {
  const { loading } = useRefreshToken();

  return <div>{!loading && <div>Refreshed</div>}</div>;
}

jest.mock('@apollo/client', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@apollo/client'),
    useQuery: () => ({
      data: {
        token: {
          accessToken: 'test-access-token',
        },
      },
      isLoading: false,
      error: null,
    }),
  };
});

test('useRefreshToken works properly', async () => {
  localStorage.setItem('refreshToken', 'test-refresh-token');
  render(<TestComponent />);

  await waitFor(() => {
    expect(localStorage.getItem('accessToken')).toBe('test-access-token');
  });
});

afterEach(() => {
  jest.clearAllMocks();
  localStorage.removeItem('refreshToken');
});
