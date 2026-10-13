import { useQuery } from '@apollo/client/react';

import { getPeriodDates } from '@/settings/usage/utils/getPeriodDates';
import { type PeriodPreset } from '@/settings/usage/utils/periodPreset';
import { FindApplicationRegistrationAnalyticsDocument } from '~/generated-metadata/graphql';

export const useApplicationRegistrationAnalytics = ({
  applicationRegistrationId,
  period,
}: {
  applicationRegistrationId: string;
  period: PeriodPreset;
}) => {
  const { data, loading, previousData, error } = useQuery(
    FindApplicationRegistrationAnalyticsDocument,
    {
      variables: {
        input: { id: applicationRegistrationId, ...getPeriodDates(period) },
      },
    },
  );

  const effectiveData = data ?? previousData;

  return {
    analytics: effectiveData?.findApplicationRegistrationAnalytics,
    isInitialLoading: loading && !effectiveData,
    error,
  };
};
