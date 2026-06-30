import { jwtDecode } from 'jwt-decode';
import { isDefined } from 'twenty-shared/utils';

import { tokenPairState } from '@/auth/states/tokenPairState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const isImpersonatingState = createAtomSelector<boolean>({
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
