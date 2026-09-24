import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { getLinkFaviconUrl, isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorLink';

const failedFaviconUrls = new Set<string>();

const StyledCompositeContainer = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: calc(${themeCssVariables.icon.size.md} * 1px);
  justify-content: center;
  position: relative;
  width: calc(${themeCssVariables.icon.size.md} * 1px);
`;

const StyledFaviconImage = styled.img`
  display: block;
  flex-shrink: 0;
  height: calc(${themeCssVariables.icon.size.md} * 1px);
  object-fit: contain;
  width: calc(${themeCssVariables.icon.size.md} * 1px);
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
  const theme = useTheme();
  const [localFailedLink, setLocalFailedLink] = useState<string | null>(null);
  const faviconUrl = getLinkFaviconUrl(link);
  const linkKey = link ?? '';
  const isKnownFailed = failedFaviconUrls.has(linkKey);
  const showFavicon =
    isDefined(faviconUrl) && !isKnownFailed && localFailedLink !== linkKey;

  return (
    <StyledCompositeContainer>
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
        <ColoredIcon
          Icon={DefaultIcon}
          color={navItemColor ?? DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK}
        />
      )}
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
