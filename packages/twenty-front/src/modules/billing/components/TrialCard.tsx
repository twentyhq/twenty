import styled from '@emotion/styled';

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
  return (
    <StyledTrialCardContainer>
      <StyledTrialDurationContainer>{`${duration} days trial`}</StyledTrialDurationContainer>
      <StyledCreditCardRequirementContainer>{`${withCreditCard ? 'With Credit Card' : 'Without Credit Card'}`}</StyledCreditCardRequirementContainer>
    </StyledTrialCardContainer>
  );
};
