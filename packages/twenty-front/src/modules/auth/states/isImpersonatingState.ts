import { jwtDecode } from 'jwt-decode';
import { isDefined } from 'twenty-shared/utils';

import { tokenPairState } from '@/auth/states/tokenPairState';
import { createSelectorV2 } from '@/ui/utilities/state/jotai/utils/createSelectorV2';

export const isImpersonatingState = createSelectorV2<boolean>({
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
