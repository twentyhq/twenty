import { PlansQueryBillingBaseProduct } from '@/billing/types/planQueryBillingBaseProduct';
import { getPlanBenefits } from '@/billing/utils/getPlanBenefits';
import styled from '@emotion/styled';
import { IconCheck } from 'twenty-ui/display';
import { BillingPlanKey } from '~/generated/graphql';

const StyledBenefitsContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

const StyledBenefitCard = styled.div`
  box-sizing: border-box;
  display: flex;
  width: 100%;
  gap: 16px;
`;

type BillingPlansBenefitsCardProps = {
  product: PlansQueryBillingBaseProduct;
  plan: BillingPlanKey;
};

export const BillingPlansBenefitsCard = ({
  product,
  plan,
}: BillingPlansBenefitsCardProps) => {
  const benefits = getPlanBenefits(plan, product);

  return (
    <StyledBenefitsContainer>
      {benefits.map((benefit) => (
        <StyledBenefitCard key={benefit}>
          <IconCheck size={16} />
          {benefit}
        </StyledBenefitCard>
      ))}
    </StyledBenefitsContainer>
  );
};
