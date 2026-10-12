import React from 'react';
import { Tag } from 'twenty-ui/primitives/data-display';
import { t } from '@lingui/core/macro';
import { BillingPlanKey } from '~/generated-metadata/graphql';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

type PlansTagsProps = {
  plan: BillingPlanKey;
  isTrialPeriod?: boolean;
};

const StyledTagsWrapper = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTrialTag = styled(Tag)`
  && {
    min-width: fit-content;
  }
`;

export const PlansTags = ({ plan, isTrialPeriod = false }: PlansTagsProps) => {
  const planDescriptor =
    plan === BillingPlanKey.PRO
      ? { color: 'sky' as const, label: t`Pro` }
      : { color: 'purple' as const, label: t`Organization` };

  return (
    <StyledTagsWrapper>
      <Tag color={planDescriptor.color}>{planDescriptor.label}</Tag>
      {isTrialPeriod && (
        <StyledTrialTag color="blue" truncate={false}>
          {t`Trial`}
        </StyledTrialTag>
      )}
    </StyledTagsWrapper>
  );
};
