import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { GET_CUSTOM_AI_PROVIDER_ACCESS } from '@/settings/admin-panel/ai/graphql/queries/getCustomAiProviderAccess';
import { type GetCustomAiProviderAccessResult } from '@/settings/admin-panel/ai/types/GetCustomAiProviderAccessResult';

export const useCustomAiProviderAccess = () => {
  const { t } = useLingui();
  const apolloAdminClient = useApolloAdminClient();

  const { data, loading } = useQuery<GetCustomAiProviderAccessResult>(
    GET_CUSTOM_AI_PROVIDER_ACCESS,
    { client: apolloAdminClient },
  );

  const access = data?.getCustomAiProviderAccess;

  // Only assume access while the query is in flight, so the section never
  // flashes its locked state; once it settles without an answer the creation
  // paths stay closed rather than failing at the mutation.
  const hasAccess = access?.hasAccess ?? loading;

  const tooltipContent = !isDefined(access)
    ? undefined
    : access.hasAccess
      ? t`Custom providers are complimentary for organizations of up to ${access.seatThreshold} seats. Above that, an Organization plan is required.`
      : t`Custom providers are complimentary for organizations of up to ${access.seatThreshold} seats. This instance has ${access.seatCount} seats, so an Organization plan is required.`;

  const gateDescription = isDefined(access)
    ? t`Custom providers are complimentary up to ${access.seatThreshold} seats. This instance has ${access.seatCount}. Upgrade to add more.`
    : t`This instance's plan could not be verified. Reload the page to try again.`;

  // The seat count and threshold stay internal: every caller wants the copy
  // built from them, not the numbers.
  return {
    hasAccess,
    tooltipContent,
    gateDescription,
  };
};
