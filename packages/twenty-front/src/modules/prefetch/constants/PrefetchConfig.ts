import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';
import { findAllFavoritesFolderOperationSignatureFactory } from '@/prefetch/graphql/operation-signatures/factories/findAllFavoritesFolderOperationSignatureFactory';
import { findAllFavoritesOperationSignatureFactory } from '@/prefetch/graphql/operation-signatures/factories/findAllFavoritesOperationSignatureFactory';
import { type PrefetchKey } from '@/prefetch/types/PrefetchKey';

export const PREFETCH_CONFIG: Record<
  PrefetchKey,
  {
    objectNameSingular: CoreObjectNameSingular;
    operationSignatureFactory: RecordGqlOperationSignatureFactory;
  }
> = {
  ALL_FAVORITES: {
    objectNameSingular: CoreObjectNameSingular.Favorite,
    operationSignatureFactory: findAllFavoritesOperationSignatureFactory,
  },
  ALL_FAVORITES_FOLDERS: {
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
    operationSignatureFactory: findAllFavoritesFolderOperationSignatureFactory,
  },
};
