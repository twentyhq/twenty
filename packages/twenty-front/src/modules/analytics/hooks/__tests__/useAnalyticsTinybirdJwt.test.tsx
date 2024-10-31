import { useAnalyticsTinybirdJwt } from '@/analytics/hooks/useAnalyticsTinybirdJwt';
import { CurrentUser, currentUserState } from '@/auth/states/currentUserState';
import { act, renderHook } from '@testing-library/react';
import { useSetRecoilState } from 'recoil';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useAnalyticsTinybirdJwt', () => {
  const TEST_JWT_NAME = 'testJwt';

  it('should return the specific analytics jwt token when available', () => {
    const { result } = renderHook(
      () => {
        const setCurrentUserState = useSetRecoilState(currentUserState);

        return {
          hook: useAnalyticsTinybirdJwt(TEST_JWT_NAME),
          setCurrentUserState,
        };
      },
      { wrapper: Wrapper },
    );

    // Test with valid JWT
    act(() => {
      result.current.setCurrentUserState({
        analyticsTinybirdJwt: {
          [TEST_JWT_NAME]: 'test-jwt-token',
        },
      } as CurrentUser);
    });
    expect(result.current.hook).toBe('test-jwt-token');

    // Test with null user
    act(() => {
      result.current.setCurrentUserState(null);
    });
    expect(result.current.hook).toBeUndefined();

    // Test with empty user object
    act(() => {
      result.current.setCurrentUserState({} as CurrentUser);
    });
    expect(result.current.hook).toBeUndefined();

    // Test with user but missing specific JWT
    act(() => {
      result.current.setCurrentUserState({
        analyticsTinybirdJwt: {
          otherJwt: 'other-token',
        },
      } as CurrentUser);
    });
    expect(result.current.hook).toBeUndefined();

    // Test with user but empty JWT object
    act(() => {
      result.current.setCurrentUserState({
        analyticsTinybirdJwt: {},
      } as CurrentUser);
    });
    expect(result.current.hook).toBeUndefined();

    // Test with undefined analyticsTinybirdJwt
    act(() => {
      result.current.setCurrentUserState({
        analyticsTinybirdJwt: undefined,
      } as CurrentUser);
    });
    expect(result.current.hook).toBeUndefined();

    // Test with multiple JWT tokens
    act(() => {
      result.current.setCurrentUserState({
        analyticsTinybirdJwt: {
          [TEST_JWT_NAME]: 'correct-token',
          otherJwt: 'other-token',
          thirdJwt: 'third-token',
        },
      } as CurrentUser);
    });
    expect(result.current.hook).toBe('correct-token');
  });

  it('should handle different JWT names correctly', () => {
    const DIFFERENT_JWT_NAME = 'differentJwt';
    const { result } = renderHook(
      () => {
        const setCurrentUserState = useSetRecoilState(currentUserState);

        return {
          hook: useAnalyticsTinybirdJwt(DIFFERENT_JWT_NAME),
          setCurrentUserState,
        };
      },
      { wrapper: Wrapper },
    );

    act(() => {
      result.current.setCurrentUserState({
        analyticsTinybirdJwt: {
          [DIFFERENT_JWT_NAME]: 'different-token',
          [TEST_JWT_NAME]: 'test-token',
        },
      } as CurrentUser);
    });
    expect(result.current.hook).toBe('different-token');
  });
});
