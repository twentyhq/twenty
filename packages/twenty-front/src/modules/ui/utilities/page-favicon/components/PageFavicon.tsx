import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { Helmet } from 'react-helmet-async';
import { useRecoilValue } from 'recoil';
import { getImageAbsoluteURI } from 'twenty-shared';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const PageFavicon = () => {
  const workspacePublicData = useRecoilValue(workspacePublicDataState);

  const link = getImageAbsoluteURI(
    workspacePublicData?.logo,
    REACT_APP_SERVER_BASE_URL,
  );

  return (
    <Helmet>
      {link && <link rel="icon" type="image/x-icon" href={link} />}
    </Helmet>
  );
};
