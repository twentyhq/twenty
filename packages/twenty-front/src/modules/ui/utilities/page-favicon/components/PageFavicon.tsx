import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { Helmet } from 'react-helmet-async';
import { useRecoilValue } from 'recoil';
import { getImageAbsoluteURI } from 'twenty-ui';

export const PageFavicon = () => {
  const workspacePublicData = useRecoilValue(workspacePublicDataState);

  return (
    <Helmet>
      {workspacePublicData?.logo && (
        <link
          rel="icon"
          type="image/x-icon"
          href={getImageAbsoluteURI(workspacePublicData.logo)}
        />
      )}
    </Helmet>
  );
};
