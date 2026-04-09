import { styled } from '@linaria/react';
import { useContext, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import type { IconComponent } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorLink';
import { getLinkFaviconUrl } from '@/navigation-menu-item/display/link/utils/getLinkFaviconUrl';
import { getNavigationMenuItemIconStyleFromColor } from '@/navigation-menu-item/common/utils/getNavigationMenuItemIconStyleFromColor';

const failedFaviconUrls = new Set<string>();

const StyledCompositeContainer = styled.div`
  align-items: center;
  border-radius: 4px;
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: 16px;
  justify-content: center;
  position: relative;
  width: 16px;
`;

const StyledMainIconWrapper = styled.div<{
  $backgroundColor: string;
  $borderColor?: string;
  $noBackgroundOrBorder?: boolean;
}>`
  align-items: center;
  background-color: ${({ $backgroundColor, $noBackgroundOrBorder }) =>
    $noBackgroundOrBorder ? 'transparent' : $backgroundColor};
  border: ${({ $borderColor, $noBackgroundOrBorder }) =>
    $noBackgroundOrBorder || !$borderColor
      ? 'none'
      : `1px solid ${$borderColor}`};
  border-radius: 4px;
  box-sizing: border-box;
  display: flex;
  inset: 0;
  justify-content: center;
  overflow: hidden;
  position: absolute;
`;

const StyledFaviconImage = styled.img`
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

const StyledLinkOverlay = styled.div<{ $backgroundColor: string }>`
  align-items: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: ${themeCssVariables.border.radius.xs};
  bottom: -5px;
  display: flex;
  height: 14px;
  justify-content: center;
  position: absolute;
  right: -6px;
  width: 14px;
`;

export type LinkIconWithLinkOverlayProps = {
  link: string | null | undefined;
  LinkIcon: IconComponent;
  DefaultIcon: IconComponent;
  color?: string | null;
};

export const LinkIconWithLinkOverlay = ({
  link,
  LinkIcon,
  DefaultIcon,
  color: navItemColor,
}: LinkIconWithLinkOverlayProps) => {
  const { theme } = useContext(ThemeContext);
  const [localFailedLink, setLocalFailedLink] = useState<string | null>(null);
  const faviconUrl = getLinkFaviconUrl(link);
  const linkKey = link ?? '';
  const isKnownFailed = failedFaviconUrls.has(linkKey);
  const showFavicon =
    isDefined(faviconUrl) && !isKnownFailed && localFailedLink !== linkKey;

  const linkStyle = getNavigationMenuItemIconStyleFromColor(
    navItemColor ?? DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK,
  );

  return (
    <StyledCompositeContainer>
      <StyledMainIconWrapper
        $backgroundColor={linkStyle.backgroundColor}
        $borderColor={linkStyle.borderColor}
        $noBackgroundOrBorder={showFavicon}
      >
        {showFavicon ? (
          <StyledFaviconImage
            src={faviconUrl}
            alt=""
            onError={() => {
              if (isDefined(link)) failedFaviconUrls.add(link);
              setLocalFailedLink(linkKey);
            }}
          />
        ) : (
          <DefaultIcon
            size="14px"
            stroke={theme.icon.stroke.md}
            color={linkStyle.iconColor}
          />
        )}
      </StyledMainIconWrapper>
      <StyledLinkOverlay $backgroundColor={themeCssVariables.grayScale.gray4}>
        <LinkIcon
          size="14px"
          stroke={theme.icon.stroke.md}
          color={themeCssVariables.grayScale.gray10}
        />
      </StyledLinkOverlay>
    </StyledCompositeContainer>
  );
};
