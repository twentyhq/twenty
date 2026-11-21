import { isNonEmptyString } from '@sniptt/guards';
import { getImageAbsoluteURI } from 'twenty-shared/utils';

import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const workspaceFaviconUrlSelector = createAtomSelector<string>({
  key: 'workspaceFaviconUrlSelector',
  get: ({ get }) => {
    const workspaceLogo = get(workspacePublicDataState)?.logo;

    if (!isNonEmptyString(workspaceLogo)) {
      return DEFAULT_WORKSPACE_LOGO;
    }

    return getImageAbsoluteURI({
      imageUrl: workspaceLogo,
      baseUrl: REACT_APP_SERVER_BASE_URL,
    });
  },
});
