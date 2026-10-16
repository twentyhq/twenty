import { useQuery } from '@apollo/client/react';
import { ListPlansDocument } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

type UsePlansOptions = {
  skip?: boolean;
};

export const usePlans = (options?: UsePlansOptions) => {
  const { data, loading, error, refetch } = useQuery(ListPlansDocument, {
    skip: options?.skip,
  });

  const isPlansLoaded = isDefined(data?.listPlans);

  const listPlans = () => {
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- Keep this developer invariant stable for error grouping.
    if (!data) throw new Error('plans is undefined');
    return data.listPlans;
  };

  return { loading, error, isPlansLoaded, listPlans, refetch };
};
