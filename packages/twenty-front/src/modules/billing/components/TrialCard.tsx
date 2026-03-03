import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type TrialCardProps = {
  duration: number;
  withCreditCard: boolean;
};

const StyledTrialCardContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTrialDurationContainer = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  display: flex;
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledCreditCardRequirementContainer = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
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
