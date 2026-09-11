import { useMutation } from '@apollo/client/react';

import {
  CreateUsageLimitDocument,
  UsageQuotasWithConsumptionDocument,
} from '~/generated-metadata/graphql';

export const useCreateUsageLimit = () => {
  const [createUsageLimit, { loading }] = useMutation(
    CreateUsageLimitDocument,
    {
      refetchQueries: [UsageQuotasWithConsumptionDocument],
    },
  );

  return { createUsageLimit, loading };
};
