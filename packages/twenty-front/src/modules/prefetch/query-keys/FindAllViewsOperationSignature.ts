import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';

export const FIND_ALL_VIEWS_OPERATION_SIGNATURE: RecordGqlOperationSignature = {
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
