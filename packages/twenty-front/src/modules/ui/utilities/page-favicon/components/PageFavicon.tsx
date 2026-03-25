import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { Helmet } from 'react-helmet-async';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getImageAbsoluteURI } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const PageFavicon = () => {
  const workspacePublicData = useAtomStateValue(workspacePublicDataState);
  return (
    <Helmet>
      <link
        rel="icon"
        type="image/x-icon"
        href={
          workspacePublicData?.logo
            ? (getImageAbsoluteURI({
                imageUrl: workspacePublicData.logo,
                baseUrl: REACT_APP_SERVER_BASE_URL,
              }) ?? DEFAULT_WORKSPACE_LOGO)
            : DEFAULT_WORKSPACE_LOGO
        }
      />
    </Helmet>
  );
};
