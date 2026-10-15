import React from 'react';
import { Tag } from 'twenty-ui/primitives/data-display';
import { t } from '@lingui/core/macro';
import { BILLING_PLAN_LABELS } from '@/settings/billing/constants/BillingPlanLabels';
import { BILLING_PLAN_TAG_COLORS } from '@/settings/billing/constants/BillingPlanTagColors';
import { type BillingPlanKey } from '~/generated-metadata/graphql';
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
  min-width: fit-content;
`;

export const PlansTags = ({ plan, isTrialPeriod = false }: PlansTagsProps) => {
  return (
    <StyledTagsWrapper>
      <Tag color={BILLING_PLAN_TAG_COLORS[plan]}>
        {t(BILLING_PLAN_LABELS[plan])}
      </Tag>
      {isTrialPeriod && (
        <StyledTrialTag color="blue" truncate={false}>
          {t`Trial`}
        </StyledTrialTag>
      )}
    </StyledTagsWrapper>
  );
};
