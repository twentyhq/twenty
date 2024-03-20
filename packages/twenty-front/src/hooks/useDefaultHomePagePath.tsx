import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';

export const useDefaultHomePagePath = () => {
  const { objectMetadataItem: companyObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Company,
    });

  const { records } = usePrefetchedData(PrefetchKey.AllViews);

  const companyViewId = records.find(
    (view: any) => view?.objectMetadataId === companyObjectMetadataItem.id,
  )?.id;
  const defaultHomePagePath =
    '/objects/companies' + (companyViewId ? `?view=${companyViewId}` : '');

  return { defaultHomePagePath };
};
