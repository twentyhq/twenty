import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';

export const findAllViewsOperationSignatureFactory: RecordGqlOperationSignatureFactory =
  () => ({
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
  });
