import { generateActivityTargetMorphFieldKeys } from '@/activities/utils/generateActivityTargetMorphFieldKeys';
import { getJoinObjectNameSingular } from '@/activities/utils/getJoinObjectNameSingular';
import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';

type FindActivityTargetsOperationSignatureFactory = {
  objectNameSingular: CoreObjectNameSingular;
  objectMetadataItems: ObjectMetadataItem[];
};

export const findActivityTargetsOperationSignatureFactory: RecordGqlOperationSignatureFactory<
  FindActivityTargetsOperationSignatureFactory
> = ({
  objectNameSingular,
  objectMetadataItems,
}: FindActivityTargetsOperationSignatureFactory) => ({
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
