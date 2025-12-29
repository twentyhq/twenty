import { getJoinObjectNameSingular } from '@/activities/utils/getJoinObjectNameSingular';
import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { type RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';
import { isDefined } from 'twenty-shared/utils';

type FindActivityTargetsOperationSignatureFactory = {
  objectNameSingular: CoreObjectNameSingular.Note | CoreObjectNameSingular.Task;
  objectMetadataItems: ObjectMetadataItem[];
};

export const findActivityTargetsOperationSignatureFactory: RecordGqlOperationSignatureFactory<
  FindActivityTargetsOperationSignatureFactory
> = ({
  objectNameSingular,
  objectMetadataItems,
}: FindActivityTargetsOperationSignatureFactory) => {
  const targetObjectNameSingular =
    getJoinObjectNameSingular(objectNameSingular);

  const targetObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === targetObjectNameSingular,
  );

  const activityObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === objectNameSingular,
  );

  if (
    !isDefined(targetObjectMetadataItem) ||
    !isDefined(activityObjectMetadataItem)
  ) {
    throw new Error(`Cannot find target or targetable object metadata item`);
  }

  const activityFieldKeys = generateDepthRecordGqlFieldsFromObject({
    objectMetadataItems,
    objectMetadataItem: activityObjectMetadataItem,
    depth: 0,
  });

  return {
    objectNameSingular: targetObjectNameSingular,
    variables: {},
    fields: {
      id: true,
      __typename: true,
      createdAt: true,
      updatedAt: true,
      [objectNameSingular]: {
        ...activityFieldKeys,
        [targetObjectMetadataItem.namePlural]:
          generateDepthRecordGqlFieldsFromObject({
            objectMetadataItems,
            objectMetadataItem: targetObjectMetadataItem,
            depth: 1,
          }),
      },
    },
  };
};
