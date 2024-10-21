import { renderHook } from '@testing-library/react';

import { CurrentUser, currentUserState } from '@/auth/states/currentUserState';
import { useAnalyticsTinybirdJwt } from '@/settings/developers/webhook/hooks/useAnalyticsTinybirdJwt';
import { act } from 'react';
import { useSetRecoilState } from 'recoil';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useAnalyticsTinybirdJwt', () => {
  it('should return the analytics jwt token', async () => {
    const { result } = renderHook(
      () => {
        const setCurrentUserState = useSetRecoilState(currentUserState);

        return {
          useAnalyticsTinybirdJwt: useAnalyticsTinybirdJwt(),
          setCurrentUserState,
        };
      },
      { wrapper: Wrapper },
    );

    act(() => {
      result.current.setCurrentUserState({
        analyticsTinybirdJwt: 'jwt',
      } as CurrentUser);
    });

    expect(result.current.useAnalyticsTinybirdJwt).toBe('jwt');

    act(() => {
      result.current.setCurrentUserState(null);
    });

    expect(result.current.useAnalyticsTinybirdJwt).toBeUndefined();

    act(() => {
      result.current.setCurrentUserState({} as CurrentUser);
    });

    expect(result.current.useAnalyticsTinybirdJwt).toBeUndefined();
  });
});
