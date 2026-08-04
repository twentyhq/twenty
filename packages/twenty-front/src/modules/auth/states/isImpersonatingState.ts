import { jwtDecode } from 'jwt-decode';
import { isDefined } from 'twenty-shared/utils';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const isImpersonatingState = createAtomSelector<boolean>({
  key: 'isImpersonatingState',
  get: ({ get }) => {
    const tokenPair = get(tokenPairState);

    if (isDefined(tokenPair?.accessOrWorkspaceAgnosticToken?.token)) {
      try {
        const decodedToken = jwtDecode<{ isImpersonating: boolean }>(
          tokenPair.accessOrWorkspaceAgnosticToken.token,
        );

        return decodedToken?.isImpersonating ?? false;
      } catch {
        return false;
      }
    }

    return get(currentUserWorkspaceState)?.isImpersonating === true;
  },
});
