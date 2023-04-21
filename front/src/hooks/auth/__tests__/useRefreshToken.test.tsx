import { render, waitFor } from '@testing-library/react';
import { useRefreshToken } from '../useRefreshToken';

const localStorageMock = (function () {
  let store: { [key: string]: string } = {};
  return {
    getItem: function (key: string) {
      return store[key];
    },
    setItem: function (key: string, value: string) {
      store[key] = value.toString();
    },
    clear: function () {
      store = {};
    },
    removeItem: function (key: string) {
      delete store[key];
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

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
      error: {},
    }),
  };
});

test('useRefreshToken works properly', async () => {
  localStorage.setItem('refreshToken', 'test-refresh-token');
  render(<TestComponent />);

  await waitFor(() => {
    expect(localStorageMock.getItem('accessToken')).toBe('test-access-token');
  });
});

afterEach(() => {
  jest.clearAllMocks();
});
