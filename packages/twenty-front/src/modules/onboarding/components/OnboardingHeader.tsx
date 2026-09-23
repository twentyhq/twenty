import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components';
import { IconChevronLeft } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

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

type OnboardingHeaderProps = {
  onBack?: () => void;
  isBackDisabled?: boolean;
  rightComponent?: ReactNode;
};

export const OnboardingHeader = ({
  onBack,
  isBackDisabled,
  rightComponent,
}: OnboardingHeaderProps) => {
  const { t } = useLingui();

  return (
    <StyledHeader>
      <StyledLeftSide>
        {isDefined(onBack) && (
          <LightIconButton
            emphasis="subtle"
            size="sm"
            onClick={onBack}
            disabled={isBackDisabled}
            aria-label={t`Go back`}
          >
            <IconChevronLeft />
          </LightIconButton>
        )}
      </StyledLeftSide>
      <StyledCenter>
        <StyledLogo />
      </StyledCenter>
      <StyledRightSide>{rightComponent}</StyledRightSide>
    </StyledHeader>
  );
};
