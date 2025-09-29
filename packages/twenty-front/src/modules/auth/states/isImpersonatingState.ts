import { jwtDecode } from 'jwt-decode';
import { selector } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { tokenPairState } from './tokenPairState';

export const isImpersonatingState = selector<boolean>({
  key: 'isImpersonatingState',
  get: ({ get }) => {
    const tokenPair = get(tokenPairState);

    if (!isDefined(tokenPair?.accessOrWorkspaceAgnosticToken?.token)) {
      return false;
    }

    try {
      const decodedToken = jwtDecode<{ isImpersonating: boolean }>(
        tokenPair.accessOrWorkspaceAgnosticToken.token,
      );
      return decodedToken?.isImpersonating ?? false;
    } catch {
      return false;
    }
  },
});
