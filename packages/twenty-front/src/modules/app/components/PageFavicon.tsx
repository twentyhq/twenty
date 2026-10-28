import { drawFaviconWithAttentionDot } from '@/app/utils/drawFaviconWithAttentionDot';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect, useState } from 'react';
import { getImageAbsoluteURI, isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type PageFaviconProps = {
  attentionDotColor?: string;
};

export const PageFavicon = ({ attentionDotColor }: PageFaviconProps) => {
  const workspacePublicData = useAtomStateValue(workspacePublicDataState);
  const [faviconWithAttentionDot, setFaviconWithAttentionDot] = useState<{
    faviconUrl: string;
    dotColor: string;
    dataUrl: string;
  } | null>(null);

  const faviconUrl = workspacePublicData?.logo
    ? (getImageAbsoluteURI({
        imageUrl: workspacePublicData.logo,
        baseUrl: REACT_APP_SERVER_BASE_URL,
      }) ?? DEFAULT_WORKSPACE_LOGO)
    : DEFAULT_WORKSPACE_LOGO;

  useEffect(() => {
    if (!isDefined(attentionDotColor)) {
      return;
    }

    let isCancelled = false;

    drawFaviconWithAttentionDot({ faviconUrl, dotColor: attentionDotColor })
      .then((dataUrl) => {
        if (!isCancelled) {
          setFaviconWithAttentionDot({
            faviconUrl,
            dotColor: attentionDotColor,
            dataUrl,
          });
        }
      })
      .catch(() => undefined);

    return () => {
      isCancelled = true;
    };
  }, [attentionDotColor, faviconUrl]);

  const href =
    isDefined(attentionDotColor) &&
    faviconWithAttentionDot?.faviconUrl === faviconUrl &&
    faviconWithAttentionDot.dotColor === attentionDotColor
      ? faviconWithAttentionDot.dataUrl
      : faviconUrl;

  return (
    <Helmet>
      <link rel="icon" type="image/x-icon" href={href} />
    </Helmet>
  );
};
