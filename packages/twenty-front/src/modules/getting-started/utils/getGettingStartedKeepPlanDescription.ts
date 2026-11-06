import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const getGettingStartedKeepPlanDescription = ({
  planLabel,
  formattedTrialEnd,
}: {
  planLabel: string | undefined;
  formattedTrialEnd: string;
}): string => {
  if (!isDefined(planLabel)) {
    return t`Your trial ends on ${formattedTrialEnd}. Add a card now to keep your plan after that. You won't be charged before then.`;
  }

  return t`Your trial ends on ${formattedTrialEnd}. Add a card now to stay on the ${planLabel} plan after that. You won't be charged before then.`;
};
