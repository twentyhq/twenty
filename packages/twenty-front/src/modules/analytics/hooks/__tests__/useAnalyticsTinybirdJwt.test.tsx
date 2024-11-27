import { useAnalyticsTinybirdJwts } from '@/analytics/hooks/useAnalyticsTinybirdJwts';
import { CurrentUser, currentUserState } from '@/auth/states/currentUserState';
import { act, renderHook } from '@testing-library/react';
import { useSetRecoilState } from 'recoil';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useAnalyticsTinybirdJwts', () => {
  const JWT_NAME = 'getWebhookAnalytics';
  const TEST_JWT_TOKEN = 'test-jwt-token';

  it('should return undefined when no user is logged in', () => {
    const { result } = renderHook(
      () => {
        const setCurrentUserState = useSetRecoilState(currentUserState);
        return {
          hook: useAnalyticsTinybirdJwts(JWT_NAME),
          setCurrentUserState,
        };
      },
      { wrapper: Wrapper },
    );

    act(() => {
      result.current.setCurrentUserState(null);
    });

    expect(result.current.hook).toBeUndefined();
  });

  it('should return the correct JWT token when available', () => {
    const { result } = renderHook(
      () => {
        const setCurrentUserState = useSetRecoilState(currentUserState);
        return {
          hook: useAnalyticsTinybirdJwts(JWT_NAME),
          setCurrentUserState,
        };
      },
      { wrapper: Wrapper },
    );

    act(() => {
      result.current.setCurrentUserState({
        id: '1',
        email: 'test@test.com',
        canImpersonate: false,
        userVars: {},
        analyticsTinybirdJwts: {
          [JWT_NAME]: TEST_JWT_TOKEN,
        },
      } as CurrentUser);
    });

    expect(result.current.hook).toBe(TEST_JWT_TOKEN);
  });

  it('should return undefined when JWT token is not available', () => {
    const { result } = renderHook(
      () => {
        const setCurrentUserState = useSetRecoilState(currentUserState);
        return {
          hook: useAnalyticsTinybirdJwts(JWT_NAME),
          setCurrentUserState,
        };
      },
      { wrapper: Wrapper },
    );

    act(() => {
      result.current.setCurrentUserState({
        id: '1',
        email: 'test@test.com',
        canImpersonate: false,
        userVars: {},
        analyticsTinybirdJwts: {
          getPageviewsAnalytics: TEST_JWT_TOKEN,
        },
      } as CurrentUser);
    });

    expect(result.current.hook).toBeUndefined();
  });
});
