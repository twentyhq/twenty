import { type CoreObjectNameSingular } from 'twenty-shared/types';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { type RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';
import { getObjectMorphJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getObjectMorphJunctionConfig';
import { isDefined } from 'twenty-shared/utils';

type FindActivityTargetsOperationSignatureFactory = {
  objectNameSingular: CoreObjectNameSingular.Note | CoreObjectNameSingular.Task;
  objectMetadataItems: EnrichedObjectMetadataItem[];
};

export const findActivityTargetsOperationSignatureFactory: RecordGqlOperationSignatureFactory<
  FindActivityTargetsOperationSignatureFactory
> = ({
  objectNameSingular,
  objectMetadataItems,
}: FindActivityTargetsOperationSignatureFactory) => {
  const activityObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === objectNameSingular,
  );

  if (!isDefined(activityObjectMetadataItem)) {
    throw new Error('Cannot resolve activity junction metadata');
  }

  const junctionConfig = getObjectMorphJunctionConfig({
    objectMetadata: activityObjectMetadataItem,
    objectMetadataItems,
  });

  if (!isDefined(junctionConfig)) {
    throw new Error('Cannot resolve activity relation on junction object');
  }

  const {
    junctionField,
    junctionObjectMetadata,
    sourceField,
    sourceJoinColumnName,
  } = junctionConfig;

  const activityFieldKeys = generateDepthRecordGqlFieldsFromObject({
    objectMetadataItems,
    objectMetadataItem: activityObjectMetadataItem,
    depth: 0,
  });

  return {
    objectNameSingular: junctionObjectMetadata.nameSingular,
    variables: {},
    fields: {
      id: true,
      __typename: true,
      createdAt: true,
      updatedAt: true,
      [sourceJoinColumnName]: true,
      [sourceField.name]: {
        ...activityFieldKeys,
        [junctionField.name]: generateDepthRecordGqlFieldsFromObject({
          objectMetadataItems,
          objectMetadataItem: junctionObjectMetadata,
          depth: 1,
        }),
      },
    },
  };
};
