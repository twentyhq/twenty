import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { AppPath } from '@/types/AppPath';
import { isDefined } from '~/utils/isDefined';

export const useDefaultHomePagePath = () => {
  const currentUser = useRecoilValue(currentUserState);
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const { records } = usePrefetchedData(PrefetchKey.AllViews);

  if (!isDefined(currentUser)) {
    return { defaultHomePagePath: AppPath.SignInUp };
  }

  const [firstObjectMetadataItem] = activeObjectMetadataItems.sort((a, b) => {
    if (a.nameSingular < b.nameSingular) {
      return -1;
    }
    if (a.nameSingular > b.nameSingular) {
      return 1;
    }
    return 0;
  });

  const firstObjectViewId = records.find(
    (view: any) => view?.objectMetadataId === firstObjectMetadataItem.id,
  )?.id;

  return {
    defaultHomePagePath: `/objects/${firstObjectMetadataItem.namePlural}${firstObjectViewId ? `?view=${firstObjectViewId}` : ''}`,
  };
};
