import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { QueryKey } from '@/object-record/query-keys/types/QueryKey';

export const ALL_VIEWS_QUERY_KEY: QueryKey = {
  objectNameSingular: CoreObjectNameSingular.View,
  variables: {},
  fields: {
    id: true,
    createdAt: true,
    updatedAt: true,
    isCompact: true,
    objectMetadataId: true,
    position: true,
    type: true,
    kanbanFieldMetadataId: true,
    name: true,
    icon: true,
    key: true,
    viewFilters: true,
    viewSorts: true,
    viewFields: true,
  },
};
