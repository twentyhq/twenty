import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { QueryKey } from '@/object-record/query-keys/types/QueryKey';

export const ALL_FAVORITES_QUERY_KEY: QueryKey = {
  objectNameSingular: CoreObjectNameSingular.Favorite,
  variables: {},
  depth: 1,
};
