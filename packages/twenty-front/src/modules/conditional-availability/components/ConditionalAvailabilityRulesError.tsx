import { type ConditionalAvailabilityRulesValidation } from '@/conditional-availability/types/ConditionalAvailabilityRulesValidation';
import { getConditionalAvailabilityRuleErrorMessage } from '@/conditional-availability/utils/getConditionalAvailabilityRuleErrorMessage';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { assertUnreachable } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledMessage = styled.div<{ isDanger: boolean }>`
  color: ${({ isDanger }) =>
    isDanger
      ? themeCssVariables.font.color.danger
      : themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type ConditionalAvailabilityRulesErrorProps = {
  rulesValidation: ConditionalAvailabilityRulesValidation;
};

export const ConditionalAvailabilityRulesError = ({
  rulesValidation,
}: ConditionalAvailabilityRulesErrorProps) => {
  const { t } = useLingui();

  if (rulesValidation.status === 'valid') {
    return null;
  }

  switch (rulesValidation.reason) {
    case 'noRow':
      return (
        <StyledMessage isDanger={false}>
          {t`Add a rule or choose Everyone`}
        </StyledMessage>
      );
    case 'incompleteRows':
      return null;
    case 'ruleError':
      return (
        <StyledMessage role="alert" isDanger>
          {getConditionalAvailabilityRuleErrorMessage({
            ruleError: rulesValidation.ruleError,
          })}
        </StyledMessage>
      );
    default:
      return assertUnreachable(rulesValidation);
  }
};
