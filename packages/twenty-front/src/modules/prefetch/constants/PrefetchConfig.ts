import { RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';
import { FIND_ALL_FAVORITES_OPERATION_SIGNATURE } from '@/prefetch/query-keys/FindAllFavoritesOperationSignature';
import { FIND_ALL_VIEWS_OPERATION_SIGNATURE } from '@/prefetch/query-keys/FindAllViewsOperationSignature';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';

export const PREFETCH_CONFIG: Record<PrefetchKey, RecordGqlOperationSignature> =
  {
    ALL_VIEWS: FIND_ALL_VIEWS_OPERATION_SIGNATURE,
    ALL_FAVORITES: FIND_ALL_FAVORITES_OPERATION_SIGNATURE,
  };
