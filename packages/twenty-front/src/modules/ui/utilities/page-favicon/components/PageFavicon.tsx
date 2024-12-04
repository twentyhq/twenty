import { Helmet } from 'react-helmet-async';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { useRecoilValue } from 'recoil';
import { getImageAbsoluteURI } from '~/utils/image/getImageAbsoluteURI';

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
