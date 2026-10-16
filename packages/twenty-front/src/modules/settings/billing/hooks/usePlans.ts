import { useQuery } from '@apollo/client/react';
import { ListPlansDocument } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

type UsePlansOptions = {
  skip?: boolean;
};

export const usePlans = (options?: UsePlansOptions) => {
  const { data, loading, error, refetch } = useQuery(ListPlansDocument, {
    skip: options?.skip,
  });

  const isPlansLoaded = isDefined(data?.listPlans);

  const listPlans = () => {
    if (!data) throw new Error(doNotTranslate('plans is undefined'));
    return data.listPlans;
  };

  return { loading, error, isPlansLoaded, listPlans, refetch };
};
