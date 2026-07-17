import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, IconCoins, IconInfoCircle } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import {
  MOBILE_VIEWPORT,
  themeCssVariables,
  useTheme,
} from 'twenty-ui/theme-constants';

const StyledHeader = styled.div`
  align-items: flex-start;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[8]} ${themeCssVariables.spacing[8]} 1px;
  width: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: ${themeCssVariables.spacing[8]} ${themeCssVariables.spacing[4]} 1px;
  }
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

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    justify-content: flex-start;
  }
`;

const StyledCenter = styled.div`
  align-items: center;
  display: flex;
  flex: 0 1 ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
  justify-content: flex-start;
  min-width: 0;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-basis: auto;
  }
`;

const StyledRightSide = styled(StyledSide)`
  justify-content: flex-end;
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledLogo = styled.div`
  background-image: url('/images/integrations/twenty-logo.svg');
  background-size: cover;
  height: ${themeCssVariables.spacing[6]};
  opacity: 0.4;
  width: ${themeCssVariables.spacing[6]};
`;

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
      <StyledCenter>
        <StyledLogo />
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
