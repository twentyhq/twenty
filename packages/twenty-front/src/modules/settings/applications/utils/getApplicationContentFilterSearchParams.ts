import { isDefined } from 'twenty-shared/utils';

import { type ApplicationContentFilterKey } from '@/settings/applications/types/ApplicationContentFilterKey';

export const getApplicationContentFilterSearchParams = ({
  searchParams,
  filterKey,
  universalIdentifier,
}: {
  searchParams: URLSearchParams;
  filterKey: ApplicationContentFilterKey;
  universalIdentifier: string | null;
}) => {
  const nextSearchParams = new URLSearchParams(searchParams);

  if (isDefined(universalIdentifier)) {
    nextSearchParams.set(filterKey, universalIdentifier);
  } else {
    nextSearchParams.delete(filterKey);
  }

  return nextSearchParams;
};
