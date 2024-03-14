import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { QueryMethodName } from '@/object-metadata/types/QueryMethodName';
import { useCachedRootQuery } from '@/object-record/cache/hooks/useCachedRootQuery';

export const useDefaultHomePagePath = () => {
  const { objectMetadataItem: companyObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Company,
    });
  const { objectMetadataItem: viewObjectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.View,
  });
  const { cachedRootQuery } = useCachedRootQuery({
    objectMetadataItem: viewObjectMetadataItem,
    queryMethodName: QueryMethodName.FindMany,
  });

  const companyViewId = cachedRootQuery?.views?.edges?.find(
    (view: any) =>
      view?.node?.objectMetadataId === companyObjectMetadataItem.id,
  )?.node.id;
  const defaultHomePagePath =
    '/objects/companies' + (companyViewId ? `?view=${companyViewId}` : '');

  return { defaultHomePagePath };
};
