import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { Helmet } from 'react-helmet-async';
import { useRecoilValue } from 'recoil';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { getImageAbsoluteURI } from 'twenty-shared/utils';

export const PageFavicon = () => {
  const workspacePublicData = useRecoilValue(workspacePublicDataState);
  return (
    <Helmet>
      {workspacePublicData?.logo && (
        <link
          rel="icon"
          type="image/x-icon"
          href={
            getImageAbsoluteURI({
              imageUrl: workspacePublicData.logo,
              baseUrl: REACT_APP_SERVER_BASE_URL,
            }) ?? DEFAULT_WORKSPACE_LOGO
          }
        />
      )}
    </Helmet>
  );
};
