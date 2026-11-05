import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationContentFilterKey } from '@/settings/applications/types/ApplicationContentFilterKey';

export const useSetApplicationContentFilterValue = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  return ({
    filterKey,
    universalIdentifier,
  }: {
    filterKey: ApplicationContentFilterKey;
    universalIdentifier: string | null;
  }) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (isDefined(universalIdentifier)) {
      nextSearchParams.set(filterKey, universalIdentifier);
    } else {
      nextSearchParams.delete(filterKey);
    }

    setSearchParams(nextSearchParams, { replace: true });
  };
};
