import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetch';
import { PrefetchKey } from '@/prefetch/types/PrefetchKeys';

export const useDefaultHomePagePath = () => {
  const { objectMetadataItem: companyObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Company,
    });

  const { prefetchQueryKey, isDataPrefetched } = usePrefetchedData(
    PrefetchKey.AllViews,
  );

  const { records } = useFindManyRecords({
    skip: !isDataPrefetched,
    ...prefetchQueryKey,
    useRecordsWithoutConnection: true,
  });

  const companyViewId = records.find(
    (view: any) => view?.objectMetadataId === companyObjectMetadataItem.id,
  )?.node.id;
  const defaultHomePagePath =
    '/objects/companies' + (companyViewId ? `?view=${companyViewId}` : '');

  return { defaultHomePagePath };
};
