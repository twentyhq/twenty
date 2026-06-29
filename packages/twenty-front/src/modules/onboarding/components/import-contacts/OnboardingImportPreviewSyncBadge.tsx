import { styled } from '@linaria/react';
import { IconArrowRight, IconGoogle, IconMicrosoft } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const SYNC_BADGE_LOGO_SIZE = 16;

const StyledBadge = styled.div`
  align-items: center;
  backdrop-filter: blur(20px);
  background-color: ${themeCssVariables.background.transparent.secondary};
  border: 1px solid ${themeCssVariables.background.transparent.lighter};
  border-radius: 0 ${themeCssVariables.border.radius.md}
    ${themeCssVariables.border.radius.md} 0;
  box-shadow: ${themeCssVariables.boxShadow.strong};
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  left: 50%;
  padding: ${themeCssVariables.spacing[2]};
  position: absolute;
  top: 84px;
  transform: translateX(-50%);
`;

const StyledDivider = styled.div`
  align-self: stretch;
  background-color: ${themeCssVariables.border.color.medium};
  width: 1px;
`;

const StyledTwentyLogo = styled.img`
  height: ${SYNC_BADGE_LOGO_SIZE}px;
  width: ${SYNC_BADGE_LOGO_SIZE}px;
`;

export const OnboardingImportPreviewSyncBadge = () => {
  const theme = useTheme();

  return (
    <StyledBadge>
      <IconGoogle size={theme.icon.size.md} />
      <IconMicrosoft size={theme.icon.size.md} />
      <StyledDivider />
      <IconArrowRight
        size={theme.icon.size.md}
        color={themeCssVariables.font.color.tertiary}
      />
      <StyledTwentyLogo src="/images/integrations/twenty-logo.svg" alt="" />
    </StyledBadge>
  );
};
