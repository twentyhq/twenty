import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { findAllViewsOperationSignatureFactory } from '@/prefetch/graphql/operation-signatures/factories/findAllViewsOperationSignatureFactory';

export const useRefreshCachedViews = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const findAllViewsOperationSignature = findAllViewsOperationSignatureFactory({
    objectMetadataItem: objectMetadataItems.find(
      (item) => item.nameSingular === CoreObjectNameSingular.View,
    ),
  });

  const { findManyRecordsLazy: refreshCachedViews } = useLazyFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.View,
    filter: findAllViewsOperationSignature.variables.filter,
    recordGqlFields: findAllViewsOperationSignature.fields,
    fetchPolicy: 'network-only',
  });

  return {
    refreshCachedViews,
  };
};
