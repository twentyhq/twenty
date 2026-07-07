import { styled } from '@linaria/react';
import { useContext, useState } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { Avatar } from 'twenty-ui/data-display';
import { IconRefresh } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type AppConnectionHeaderProps = {
  appLogoUrl?: string | null;
  appName: string;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
`;

const StyledAppLogoTile = styled.div`
  align-items: center;
  backdrop-filter: ${themeCssVariables.blur.strong};
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[12]};
  justify-content: center;
  padding: ${themeCssVariables.spacing[1]};
  width: ${themeCssVariables.spacing[12]};
`;

const StyledAppLogo = styled.img`
  border-radius: ${themeCssVariables.border.radius.sm};
  height: ${themeCssVariables.spacing[10]};
  object-fit: cover;
  width: ${themeCssVariables.spacing[10]};
`;

const StyledLinkIconContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.rounded};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  color: ${themeCssVariables.font.color.primary};
  corner-shape: round;
  display: flex;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[6]};
  justify-content: center;
  width: ${themeCssVariables.spacing[6]};
`;

export const AppConnectionHeader = ({
  appLogoUrl,
  appName,
}: AppConnectionHeaderProps) => {
  const { theme } = useContext(ThemeContext);

  const [hasAppLogoError, setHasAppLogoError] = useState(false);

  const showAppLogoImage = isNonEmptyString(appLogoUrl) && !hasAppLogoError;

  return (
    <StyledContainer>
      <StyledAppLogoTile>
        <StyledAppLogo src={'/images/integrations/twenty-logo.svg'} alt="" />
      </StyledAppLogoTile>
      <StyledLinkIconContainer aria-hidden>
        <IconRefresh size={theme.icon.size.md} stroke={theme.icon.stroke.lg} />
      </StyledLinkIconContainer>
      <StyledAppLogoTile>
        {showAppLogoImage ? (
          <StyledAppLogo
            src={appLogoUrl}
            alt=""
            onError={() => setHasAppLogoError(true)}
          />
        ) : (
          <Avatar
            size="xl"
            placeholder={appName}
            placeholderColorSeed={appName}
            type="squared"
          />
        )}
      </StyledAppLogoTile>
    </StyledContainer>
  );
};
