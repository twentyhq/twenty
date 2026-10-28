import { PageFaviconAttentionDotEffect } from '@/app/effect-components/PageFaviconAttentionDotEffect';
import { type FaviconWithAttentionDot } from '@/app/types/FaviconWithAttentionDot';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { Helmet } from '@dr.pogodin/react-helmet';
import { isNonEmptyString } from '@sniptt/guards';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useState } from 'react';
import { getImageAbsoluteURI, isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type PageFaviconProps = {
  attentionDotColor?: string;
};

export const PageFavicon = ({ attentionDotColor }: PageFaviconProps) => {
  const workspacePublicData = useAtomStateValue(workspacePublicDataState);
  const [faviconWithAttentionDot, setFaviconWithAttentionDot] =
    useState<FaviconWithAttentionDot | null>(null);

  const faviconUrl = isNonEmptyString(workspacePublicData?.logo)
    ? (getImageAbsoluteURI({
        imageUrl: workspacePublicData.logo,
        baseUrl: REACT_APP_SERVER_BASE_URL,
      }) ?? DEFAULT_WORKSPACE_LOGO)
    : DEFAULT_WORKSPACE_LOGO;

  const href =
    isDefined(attentionDotColor) &&
    faviconWithAttentionDot?.faviconUrl === faviconUrl &&
    faviconWithAttentionDot.dotColor === attentionDotColor
      ? faviconWithAttentionDot.dataUrl
      : faviconUrl;

  return (
    <>
      {isDefined(attentionDotColor) && (
        <PageFaviconAttentionDotEffect
          faviconUrl={faviconUrl}
          dotColor={attentionDotColor}
          onFaviconDrawn={setFaviconWithAttentionDot}
        />
      )}
      <Helmet>
        <link rel="icon" type="image/x-icon" href={href} />
      </Helmet>
    </>
  );
};
