import { isNonEmptyString } from '@sniptt/guards';

import { FaviconWithUnreadDotEffect } from '@/app/effect-components/FaviconWithUnreadDotEffect';
import { faviconWithUnreadDotState } from '@/app/states/faviconWithUnreadDotState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getImageAbsoluteURI } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type PageFaviconProps = {
  hasUnreadDot?: boolean;
};

export const PageFavicon = ({ hasUnreadDot = false }: PageFaviconProps) => {
  const workspacePublicData = useAtomStateValue(workspacePublicDataState);
  const faviconWithUnreadDot = useAtomStateValue(faviconWithUnreadDotState);
  const faviconUrl = isNonEmptyString(workspacePublicData?.logo)
    ? getImageAbsoluteURI({
        imageUrl: workspacePublicData.logo,
        baseUrl: REACT_APP_SERVER_BASE_URL,
      })
    : DEFAULT_WORKSPACE_LOGO;
  const faviconHref =
    hasUnreadDot && faviconWithUnreadDot?.faviconUrl === faviconUrl
      ? faviconWithUnreadDot.href
      : faviconUrl;

  return (
    <>
      {hasUnreadDot && <FaviconWithUnreadDotEffect faviconUrl={faviconUrl} />}
      <Helmet>
        <link rel="icon" type="image/x-icon" href={faviconHref} />
      </Helmet>
    </>
  );
};
