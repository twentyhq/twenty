import { QueryKey } from '@/object-record/query-keys/types/QueryKey';
import { ALL_FAVORITES_QUERY_KEY } from '@/prefetch/query-keys/AllFavoritesQueryKey';
import { ALL_VIEWS_QUERY_KEY } from '@/prefetch/query-keys/AllViewsQueryKey';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';

export const PREFETCH_CONFIG: Record<PrefetchKey, QueryKey> = {
  ALL_VIEWS: ALL_VIEWS_QUERY_KEY,
  ALL_FAVORITES: ALL_FAVORITES_QUERY_KEY,
};
