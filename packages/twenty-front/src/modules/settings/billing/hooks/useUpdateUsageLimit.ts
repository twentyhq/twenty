import { useMutation } from '@apollo/client/react';

import {
  UpdateUsageLimitDocument,
  UsageQuotasWithConsumptionDocument,
} from '~/generated-metadata/graphql';

export const useUpdateUsageLimit = () => {
  const [updateUsageLimit, { loading }] = useMutation(
    UpdateUsageLimitDocument,
    {
      refetchQueries: [UsageQuotasWithConsumptionDocument],
    },
  );

  return { updateUsageLimit, loading };
};
