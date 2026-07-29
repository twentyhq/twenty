import { Link } from 'react-router-dom';

import { BookCallEmbed } from '@/onboarding/components/BookCallEmbed';
import { BookCallOnboardingStepActions } from '@/onboarding/components/BookCallOnboardingStepActions';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { IconChevronLeft } from 'twenty-ui/icon';
import { LightButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { OnboardingStatus } from '~/generated-metadata/graphql';

const StyledPage = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
`;

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
  min-height: 0;
  overflow: hidden;
  width: 100%;
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

export const BookCall = () => {
  const { t } = useLingui();
  const onboardingStatus = useOnboardingStatus();

  const isOnboardingStep = onboardingStatus === OnboardingStatus.BOOK_CALL;

  return (
    <StyledPage>
      <StyledContent>
        <BookCallEmbed />
      </StyledContent>
      <StyledFooter>
        {isOnboardingStep ? (
          <BookCallOnboardingStepActions />
        ) : (
          <Link to={AppPath.PlanRequired}>
            <LightButton Icon={IconChevronLeft} title={t`Back`} />
          </Link>
        )}
      </StyledFooter>
    </StyledPage>
  );
};
