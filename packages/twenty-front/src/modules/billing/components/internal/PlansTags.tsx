import React from 'react';
import { Tag } from 'twenty-ui/components';
import { t } from '@lingui/core/macro';
import { BillingPlanKey } from '~/generated-metadata/graphql';
import styled from '@emotion/styled';

export type PlansTagsProps = {
  plan: BillingPlanKey;
  isTrialPeriod?: boolean;
};

const StyledTagsWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const PlansTags = ({ plan, isTrialPeriod = false }: PlansTagsProps) => {
  const planDescriptor =
    plan === BillingPlanKey.PRO
      ? { color: 'sky' as const, label: t`Pro` }
      : { color: 'purple' as const, label: t`Organization` };

  return (
    <StyledTagsWrapper>
      <Tag color={planDescriptor.color} text={planDescriptor.label} />
      {isTrialPeriod && <Tag color="blue" text={t`Trial`} preventShrink />}
    </StyledTagsWrapper>
  );
};
