import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Helmet } from 'react-helmet-async';
import { getImageAbsoluteURI, isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const PageFavicon = () => {
  const workspacePublicData = useAtomStateValue(workspacePublicDataState);
  const faviconUrl = isDefined(workspacePublicData?.logo)
    ? getImageAbsoluteURI({
        imageUrl: workspacePublicData.logo,
        baseUrl: REACT_APP_SERVER_BASE_URL,
      })
    : undefined;

  if (!isDefined(faviconUrl)) {
    return null;
  }

  return (
    <Helmet>
      <link rel="icon" type="image/x-icon" href={faviconUrl} />
    </Helmet>
  );
};
