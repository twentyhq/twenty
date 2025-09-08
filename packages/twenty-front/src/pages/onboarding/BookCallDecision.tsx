import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { Modal } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { LightButton, MainButton } from 'twenty-ui/input';
import { useSkipBookOnboardingStepMutation } from '~/generated-metadata/graphql';

const StyledCoverImage = styled.img`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  height: 204px;
  object-fit: cover;
  width: 320px;
`;

const StyledModalContent = styled(Modal.Content)`
  gap: ${({ theme }) => theme.spacing(8)};
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
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

export const BookCallDecision = () => {
  const { t } = useLingui();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const [skipBookOnboardingStepMutation] = useSkipBookOnboardingStepMutation();

  const handleFinish = async () => {
    await skipBookOnboardingStepMutation();
    setNextOnboardingStatus();
  };

  return (
    <StyledModalContent isVerticalCentered isHorizontalCentered>
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
        <StyledLink to={AppPath.BookCall}>
          <MainButton title={t`Book onboarding`} width={198} />
        </StyledLink>
        <LightButton title={t`Finish`} onClick={handleFinish} />
      </StyledButtonContainer>
    </StyledModalContent>
  );
};
