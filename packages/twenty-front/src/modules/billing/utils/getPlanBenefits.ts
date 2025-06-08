import { PlansQueryBillingBaseProduct } from '@/billing/types/planQueryBillingBaseProduct';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { BillingPlanKey } from '~/generated/graphql';

export const getPlanBenefits = (
  planKey: BillingPlanKey,
  product: PlansQueryBillingBaseProduct,
) => {
  if (isDefined(product.marketingFeatures)) return product.marketingFeatures;
  if (planKey === BillingPlanKey.ENTERPRISE) {
    return [
      t`Full access`,
      t`Unlimited contacts`,
      t`Email integration`,
      t`Custom objects`,
      t`API & Webhooks`,
      t`20,000 workflow node executions`,
      t`SSO (SAML / OIDC)`,
    ];
  }

  return [
    t`Full access`,
    t`Unlimited contacts`,
    t`Email integration`,
    t`Custom objects`,
    t`API & Webhooks`,
    t`10,000 workflow node executions`,
  ];
};
