import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { MainButton } from 'twenty-ui/input';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentUserState } from '@/auth/states/currentUserState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { AppPath } from '@/types/AppPath';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { Link } from 'react-router-dom';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type BookCallQueryParams = {
  email?: string;
};

const StyledLink = styled(Link)`
  text-decoration: none;
  width: 100%;
`;

const StyledButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(10)};
  width: 100%;
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  line-height: 1.6;
  margin-top: ${({ theme }) => theme.spacing(3)};
  text-align: center;
`;

const StyledBenefitsList = styled.ul`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  line-height: 1.8;
  list-style: none;
  margin-top: ${({ theme }) => theme.spacing(4)};
  padding: 0;
  text-align: left;

  li:before {
    content: '✓ ';
    color: ${({ theme }) => theme.color.green};
    font-weight: ${({ theme }) => theme.font.weight.medium};
    margin-right: ${({ theme }) => theme.spacing(1)};
  }
`;

export const BookCallDecision = () => {
  const { t } = useLingui();
  const navigate = useNavigateApp();
  const calendarBookingPageId = useRecoilValue(calendarBookingPageIdState);
  const currentUser = useRecoilValue(currentUserState);

  if (!isDefined(calendarBookingPageId)) {
    navigate(AppPath.CreateWorkspace);
    return null;
  }

  const handleBookCall = () => {
    const queryParams: BookCallQueryParams = {};

    if (isDefined(currentUser?.email)) {
      queryParams.email = currentUser.email;
    }

    navigate(AppPath.BookCall, undefined, queryParams);
  };

  return (
    // this is ai generated points, feels weird but will update after feedback
    <Modal.Content isVerticalCentered isHorizontalCentered>
      <Title noMarginTop>
        <Trans>Get the most out of Twenty</Trans>
      </Title>
      <SubTitle>
        <Trans>Would you like personalized guidance?</Trans>
      </SubTitle>

      <StyledDescription>
        <Trans>
          Our team can help you set up Twenty to match your specific needs and
          workflows.
        </Trans>
      </StyledDescription>

      <StyledBenefitsList>
        <li>
          <Trans>Learn best practices from our experts</Trans>
        </li>
        <li>
          <Trans>Get answers to your specific questions</Trans>
        </li>
        <li>
          <Trans>Discover advanced features for your use case</Trans>
        </li>
        <li>
          <Trans>Accelerate your team's adoption</Trans>
        </li>
      </StyledBenefitsList>

      <StyledButtonsContainer>
        <MainButton
          title={t`Schedule a personalized demo`}
          fullWidth
          onClick={handleBookCall}
        />
        <StyledLink to={AppPath.CreateWorkspace}>
          <MainButton
            title={t`I'll explore on my own`}
            variant="secondary"
            fullWidth
          />
        </StyledLink>
      </StyledButtonsContainer>
    </Modal.Content>
  );
};
