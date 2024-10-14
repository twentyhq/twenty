import { ApolloError, gql, InMemoryCache } from '@apollo/client';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';

import { ApolloFactory, Options } from '../apollo.factory';

enableFetchMocks();

jest.mock('@/auth/services/AuthService', () => {
  const initialAuthService = jest.requireActual('@/auth/services/AuthService');
  return {
    ...initialAuthService,
    renewToken: jest.fn().mockReturnValue(
      Promise.resolve({
        accessToken: { token: 'newAccessToken', expiresAt: '' },
        refreshToken: { token: 'newRefreshToken', expiresAt: '' },
      }),
    ),
  };
});

const mockOnError = jest.fn();
const mockOnNetworkError = jest.fn();

const createMockOptions = (): Options<any> => ({
  uri: 'http://localhost:3000',
  initialTokenPair: {
    accessToken: { token: 'mockAccessToken', expiresAt: '' },
    refreshToken: { token: 'mockRefreshToken', expiresAt: '' },
  },
  cache: new InMemoryCache(),
  isDebugMode: true,
  onError: mockOnError,
  onNetworkError: mockOnNetworkError,
});

const makeRequest = async () => {
  const options = createMockOptions();
  const apolloFactory = new ApolloFactory(options);

  const client = apolloFactory.getClient();

  await client.mutate({
    mutation: gql`
      mutation Track($action: String!, $payload: JSON!) {
        track(action: $action, payload: $payload) {
          success
        }
      }
    `,
  });
};

describe('xApolloFactory', () => {
  it('should create an instance of ApolloFactory', () => {
    const options = createMockOptions();
    const apolloFactory = new ApolloFactory(options);
    expect(apolloFactory).toBeInstanceOf(ApolloFactory);
  });

  it('should call onError when encountering "Unauthorized" error', async () => {
    const errors = [{ message: 'Unauthorized' }];
    fetchMock.mockResponse(() =>
      Promise.resolve({
        body: JSON.stringify({
          data: {},
          errors,
        }),
      }),
    );
    try {
      await makeRequest();
    } catch (error) {
      expect(error).toBeInstanceOf(ApolloError);
      expect((error as ApolloError).message).toBe('Unauthorized');
      expect(mockOnError).toHaveBeenCalledWith(errors);
    }
  }, 10000);

  it('should call onError when encountering "UNAUTHENTICATED" error', async () => {
    const errors = [
      {
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      },
    ];
    fetchMock.mockResponse(() =>
      Promise.resolve({
        body: JSON.stringify({
          data: {},
          errors,
        }),
      }),
    );

    try {
      await makeRequest();
    } catch (error) {
      expect(error).toBeInstanceOf(ApolloError);
      expect((error as ApolloError).message).toBe('Error message not found.');
      expect(mockOnError).toHaveBeenCalledWith(errors);
    }
  }, 10000);

  it('should call onNetworkError when encountering a network error', async () => {
    const errors = [
      {
        message: 'Unknown error',
      },
    ];
    fetchMock.mockResponse(() =>
      Promise.resolve({
        body: JSON.stringify({
          data: {},
          errors,
        }),
      }),
    );

    try {
      await makeRequest();
    } catch (error) {
      expect(error).toBeInstanceOf(ApolloError);
      expect((error as ApolloError).message).toBe('Unknown error');
      expect(mockOnError).toHaveBeenCalledWith(errors);
    }
  }, 10000);

  it('should call renewToken when encountering any error', async () => {
    const mockError = { message: 'Unknown error' };
    fetchMock.mockReject(() => Promise.reject(mockError));

    try {
      await makeRequest();
    } catch (error) {
      expect(error).toBeInstanceOf(ApolloError);
      expect((error as ApolloError).message).toBe('Unknown error');
      expect(mockOnNetworkError).toHaveBeenCalledWith(mockError);
    }
  }, 10000);
});
