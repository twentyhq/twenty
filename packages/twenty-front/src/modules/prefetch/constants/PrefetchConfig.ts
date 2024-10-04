import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';
import { findAllFavoritesOperationSignatureFactory } from '@/prefetch/operation-signatures/factories/findAllFavoritesOperationSignatureFactory';
import { findAllViewsOperationSignatureFactory } from '@/prefetch/operation-signatures/factories/findAllViewsOperationSignatureFactory';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';

export const PREFETCH_CONFIG: Record<
  PrefetchKey,
  {
    objectNameSingular: CoreObjectNameSingular;
    operationSignatureFactory: RecordGqlOperationSignatureFactory;
  }
> = {
  ALL_VIEWS: {
    objectNameSingular: CoreObjectNameSingular.View,
    operationSignatureFactory: findAllViewsOperationSignatureFactory,
  },
  ALL_FAVORITES: {
    objectNameSingular: CoreObjectNameSingular.Favorite,
    operationSignatureFactory: findAllFavoritesOperationSignatureFactory,
  },
};
