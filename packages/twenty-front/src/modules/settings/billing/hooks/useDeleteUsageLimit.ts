import { useMutation } from '@apollo/client/react';

import {
  DeleteUsageLimitDocument,
  UsageQuotasWithConsumptionDocument,
} from '~/generated-metadata/graphql';

export const useDeleteUsageLimit = () => {
  const [deleteUsageLimit, { loading }] = useMutation(
    DeleteUsageLimitDocument,
    {
      refetchQueries: [UsageQuotasWithConsumptionDocument],
    },
  );

  return { deleteUsageLimit, loading };
};
