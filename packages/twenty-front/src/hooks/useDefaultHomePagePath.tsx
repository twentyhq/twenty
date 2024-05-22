import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { AppPath } from '@/types/AppPath';

export const useDefaultHomePagePath = () => {
  const currentUser = useRecoilValue(currentUserState);
  const { objectMetadataItem: companyObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Company,
    });

  const { records } = usePrefetchedData(PrefetchKey.AllViews);

  const companyViewId = records.find(
    (view: any) => view?.objectMetadataId === companyObjectMetadataItem.id,
  )?.id;
  const defaultHomePagePath = currentUser
    ? '/objects/companies' + (companyViewId ? `?view=${companyViewId}` : '')
    : AppPath.SignInUp;

  return { defaultHomePagePath };
};
