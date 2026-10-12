import { useQuery } from '@apollo/client/react';
import { useState } from 'react';

import { getPeriodDates } from '@/settings/usage/utils/getPeriodDates';
import { getPeriodOptions } from '@/settings/usage/utils/getPeriodOptions';
import { type PeriodPreset } from '@/settings/usage/utils/periodPreset';
import { FindApplicationRegistrationAnalyticsDocument } from '~/generated-metadata/graphql';

export const useApplicationRegistrationAnalytics = ({
  applicationRegistrationId,
  skip,
}: {
  applicationRegistrationId: string;
  skip?: boolean;
}) => {
  const [period, setPeriod] = useState<PeriodPreset>('30d');

  const periodDates = getPeriodDates(period);
  const periodOptions = getPeriodOptions();

  const { data, loading, previousData, error } = useQuery(
    FindApplicationRegistrationAnalyticsDocument,
    {
      variables: {
        input: { id: applicationRegistrationId, ...periodDates },
      },
      skip,
    },
  );

  const effectiveData = data ?? previousData;

  return {
    analytics: effectiveData?.findApplicationRegistrationAnalytics,
    isInitialLoading: loading && !effectiveData,
    error,
    period,
    setPeriod,
    periodOptions,
  };
};
