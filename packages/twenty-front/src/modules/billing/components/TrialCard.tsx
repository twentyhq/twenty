import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';

type TrialCardProps = {
  duration: number;
  withCreditCard: boolean;
};

const StyledTrialCardContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTrialDurationContainer = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledCreditCardRequirementContainer = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  display: flex;
`;

export const TrialCard = ({ duration, withCreditCard }: TrialCardProps) => {
  const { t } = useLingui();
  return (
    <StyledTrialCardContainer>
      <StyledTrialDurationContainer>{t`${duration} days trial`}</StyledTrialDurationContainer>
      <StyledCreditCardRequirementContainer>
        {withCreditCard ? t`With Credit Card` : t`Without Credit Card`}
      </StyledCreditCardRequirementContainer>
    </StyledTrialCardContainer>
  );
};
