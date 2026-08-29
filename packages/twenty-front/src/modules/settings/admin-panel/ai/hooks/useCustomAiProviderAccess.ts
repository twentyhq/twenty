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

  // Assume access while the query is in flight so the section never flashes
  // its locked state for instances that are entitled to it.
  const hasAccess = access?.hasAccess ?? true;

  const tooltipContent = !isDefined(access)
    ? undefined
    : access.hasAccess
      ? t`Custom providers are complimentary for organizations under ${access.seatThreshold} seats. Above that, an Organization plan is required.`
      : t`Custom providers are complimentary for organizations under ${access.seatThreshold} seats. This instance has ${access.seatCount} seats, so an Organization plan is required.`;

  return {
    hasAccess,
    isLoadingAccess: loading,
    seatCount: access?.seatCount,
    seatThreshold: access?.seatThreshold,
    tooltipContent,
  };
};
