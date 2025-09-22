import { useListPlansQuery } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

export const usePlans = () => {
  const { data, loading, error } = useListPlansQuery();

  const isPlansLoaded = isDefined(data?.listPlans);

  const listPlans = () => {
    if (!data) throw new Error('plans is undefined');
    return data.listPlans;
  };

  return { loading, error, isPlansLoaded, listPlans };
};
