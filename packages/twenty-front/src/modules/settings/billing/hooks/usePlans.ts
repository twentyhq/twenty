import { useQuery } from '@apollo/client/react';
import { BillingPlansDocument } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

type UsePlansOptions = {
  skip?: boolean;
};

export const usePlans = (options?: UsePlansOptions) => {
  const { data, loading, error, refetch } = useQuery(BillingPlansDocument, {
    skip: options?.skip,
  });

  const isPlansLoaded = isDefined(data?.billingPlans);

  const listPlans = () => {
    if (!data) {
      throw new Error(doNotTranslate('plans is undefined'));
    }
    return data.billingPlans;
  };

  return { loading, error, isPlansLoaded, listPlans, refetch };
};
