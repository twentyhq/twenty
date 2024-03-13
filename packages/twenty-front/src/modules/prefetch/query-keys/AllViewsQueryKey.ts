import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { QueryKey } from '@/object-record/query-keys/types/QueryKey';

export const ALL_VIEWS_QUERY_KEY: QueryKey = {
  objectNameSingular: CoreObjectNameSingular.View,
  variables: {},
  depth: 1,
};
