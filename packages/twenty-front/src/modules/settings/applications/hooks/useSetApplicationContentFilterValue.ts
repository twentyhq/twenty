import { useSearchParams } from 'react-router-dom';

import { type ApplicationContentFilterKey } from '@/settings/applications/types/ApplicationContentFilterKey';
import { getApplicationContentFilterSearchParams } from '@/settings/applications/utils/getApplicationContentFilterSearchParams';

export const useSetApplicationContentFilterValue = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  return ({
    filterKey,
    universalIdentifier,
  }: {
    filterKey: ApplicationContentFilterKey;
    universalIdentifier: string | null;
  }) => {
    setSearchParams(
      getApplicationContentFilterSearchParams({
        searchParams,
        filterKey,
        universalIdentifier,
      }),
      { replace: true },
    );
  };
};
