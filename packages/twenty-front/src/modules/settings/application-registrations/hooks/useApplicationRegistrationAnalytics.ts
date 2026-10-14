import { useQuery } from '@apollo/client/react';

import { FindApplicationRegistrationAnalyticsDocument } from '~/generated-metadata/graphql';

export const useApplicationRegistrationAnalytics = ({
  applicationRegistrationId,
  periodStart,
  periodEnd,
}: {
  applicationRegistrationId: string;
  periodStart: string;
  periodEnd: string;
}) => {
  const { data, loading, previousData, error } = useQuery(
    FindApplicationRegistrationAnalyticsDocument,
    {
      variables: {
        input: { id: applicationRegistrationId, periodStart, periodEnd },
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
