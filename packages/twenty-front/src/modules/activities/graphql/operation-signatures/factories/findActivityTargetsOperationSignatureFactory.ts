import { generateActivityTargetMorphFieldKeys } from '@/activities/utils/generateActivityTargetMorphFieldKeys';
import { getJoinObjectNameSingular } from '@/activities/utils/getJoinObjectNameSingular';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';

export const findActivityTargetsOperationSignatureFactory: RecordGqlOperationSignatureFactory =
  ({
    objectNameSingular,
    objectMetadataItems,
  }: {
    objectNameSingular: CoreObjectNameSingular;
    objectMetadataItems: ObjectMetadataItem[];
  }) => ({
    objectNameSingular: getJoinObjectNameSingular(objectNameSingular),
    variables: {},
    fields: {
      id: true,
      __typename: true,
      createdAt: true,
      updatedAt: true,
      ...generateActivityTargetMorphFieldKeys(objectMetadataItems),
    },
  });
