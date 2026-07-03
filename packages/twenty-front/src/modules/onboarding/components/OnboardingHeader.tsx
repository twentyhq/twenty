import { useOnboardingContentWidth } from '@/onboarding/hooks/useOnboardingContentWidth';
import { useOnboardingMotionTransition } from '@/onboarding/hooks/useOnboardingMotionTransition';
import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, IconCoins, IconInfoCircle } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const StyledHeader = styled.div`
  align-items: flex-start;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[8]} ${themeCssVariables.spacing[8]} 1px;
  width: 100%;
`;

const StyledSide = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex: 1 1 0;
  min-width: 0;
`;

const StyledLeftSide = styled(StyledSide)`
  justify-content: flex-end;
  padding-right: ${themeCssVariables.spacing[1]};
`;

const StyledCenter = styled.div<{ contentWidth: number }>`
  align-items: center;
  display: flex;
  flex: 0 1 ${({ contentWidth }) => `${contentWidth}px`};
  justify-content: flex-start;
  min-width: 0;
`;

const StyledRightSide = styled(StyledSide)`
  justify-content: flex-end;
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledLogoBase = styled.div`
  background-image: url('/images/integrations/twenty-logo.svg');
  background-size: cover;
  height: ${themeCssVariables.spacing[6]};
  opacity: 0.4;
  width: ${themeCssVariables.spacing[6]};
`;

const StyledLogo = motion.create(StyledLogoBase);

const StyledFreeCredits = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
`;

const StyledCreditsTag = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  border-bottom-left-radius: ${themeCssVariables.border.radius.pill};
  border-left: 1px solid ${themeCssVariables.border.color.light};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  border-top-left-radius: ${themeCssVariables.border.radius.pill};
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[6]};
  padding: 0 ${themeCssVariables.spacing[2]} 0
    ${themeCssVariables.spacing['1.5']};
`;

const StyledCreditsCount = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledCreditsLabel = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledInfoTag = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.tertiary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-bottom-right-radius: ${themeCssVariables.border.radius.rounded};
  border-top-right-radius: ${themeCssVariables.border.radius.rounded};
  box-sizing: border-box;
  display: flex;
  height: ${themeCssVariables.spacing[6]};
  justify-content: center;
  padding: 0 ${themeCssVariables.spacing['1.5']} 0
    ${themeCssVariables.spacing[1]};
`;

type OnboardingHeaderProps = {
  onBack?: () => void;
  freeCredits?: number;
};

export const OnboardingHeader = ({
  onBack,
  freeCredits,
}: OnboardingHeaderProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const contentWidth = useOnboardingContentWidth();
  const transition = useOnboardingMotionTransition();

  return (
    <StyledHeader>
      <StyledLeftSide>
        {isDefined(onBack) && (
          <LightIconButton
            Icon={IconChevronLeft}
            accent="tertiary"
            size="small"
            onClick={onBack}
            aria-label={t`Go back`}
          />
        )}
      </StyledLeftSide>
      <StyledCenter contentWidth={contentWidth}>
        <StyledLogo layout transition={transition} />
      </StyledCenter>
      <StyledRightSide>
        {isDefined(freeCredits) && (
          <StyledFreeCredits>
            <StyledCreditsTag>
              <IconCoins
                size={theme.icon.size.md}
                color={themeCssVariables.font.color.tertiary}
              />
              <StyledCreditsCount>{freeCredits}</StyledCreditsCount>
              <StyledCreditsLabel>{t`free credits`}</StyledCreditsLabel>
            </StyledCreditsTag>
            <StyledInfoTag>
              <IconInfoCircle
                size={theme.icon.size.md}
                color={themeCssVariables.font.color.tertiary}
              />
            </StyledInfoTag>
          </StyledFreeCredits>
        )}
      </StyledRightSide>
    </StyledHeader>
  );
};
