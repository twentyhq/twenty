import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { LightButton, MainButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useMutation } from '@apollo/client/react';
import { SkipBookOnboardingStepDocument } from '~/generated-metadata/graphql';

const StyledPage = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  justify-content: center;
  min-height: 0;
  width: 100%;
`;

const StyledCoverImage = styled.img`
  border-radius: ${themeCssVariables.border.radius.sm};
  height: 204px;
  max-width: 100%;
  object-fit: cover;
  width: 320px;
`;

const StyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StyledButtonContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledLinkContainer = styled.div`
  > a {
    text-decoration: none;
  }
`;

export const BookCallDecision = () => {
  const { t } = useLingui();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const [skipBookOnboardingStepMutation] = useMutation(
    SkipBookOnboardingStepDocument,
  );

  const handleFinish = async () => {
    await skipBookOnboardingStepMutation();
    setNextOnboardingStatus();
  };

  return (
    <StyledPage>
      <StyledTitleContainer>
        <Title noMarginTop>
          <Trans>Book your onboarding</Trans>
        </Title>
        <SubTitle>
          <Trans>
            Our team can help you set up your workspace to match your specific
            needs and workflows.
          </Trans>
        </SubTitle>
      </StyledTitleContainer>
      <StyledCoverImage src="/images/placeholders/onboarding-covers/onboarding-book-call-decision-cover.png" />
      <StyledButtonContainer>
        <StyledLinkContainer>
          <Link to={AppPath.BookCall}>
            <MainButton title={t`Book onboarding`} width={198} />
          </Link>
        </StyledLinkContainer>
        <LightButton title={t`Finish`} onClick={handleFinish} />
      </StyledButtonContainer>
    </StyledPage>
  );
};
