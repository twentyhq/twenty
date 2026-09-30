import { styled } from '@linaria/react';
import { IconArrowRight, IconGoogle, IconMicrosoft } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const SYNC_BADGE_LOGO_SIZE = 16;

const StyledBadge = styled.div`
  align-items: center;
  backdrop-filter: blur(20px);
  background-color: ${themeCssVariables.background.transparent.secondary};
  border: 1px solid ${themeCssVariables.background.transparent.lighter};
  border-left: none;
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  left: 50%;
  padding: ${themeCssVariables.spacing[2]};
  position: absolute;
  top: 83px;
  transform: translateX(-50%);
`;

const StyledArrow = styled.span`
  animation: onboardingImportPreviewArrowIn 800ms cubic-bezier(0.22, 1, 0.36, 1)
    450ms both;
  display: flex;

  @keyframes onboardingImportPreviewArrowIn {
    from {
      opacity: 0.3;
      transform: translateX(-6px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const StyledDivider = styled.div`
  align-self: stretch;
  background-color: ${themeCssVariables.border.color.medium};
  width: 1px;
`;

const StyledTwentyLogo = styled.img`
  border-radius: ${themeCssVariables.border.radius.xs};
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
      <StyledArrow>
        <IconArrowRight
          size={theme.icon.size.md}
          color={themeCssVariables.font.color.tertiary}
        />
      </StyledArrow>
      <StyledTwentyLogo src="/images/integrations/twenty-logo.svg" alt="" />
    </StyledBadge>
  );
};
