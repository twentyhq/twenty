import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { generateJunctionRelationGqlFields } from '@/object-record/graphql/record-gql-fields/utils/generateJunctionRelationGqlFields';
import { type RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';
import { getObjectMorphJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getObjectMorphJunctionConfig';
import { type CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type FindActivitiesOperationSignatureFactory = {
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectNameSingular: CoreObjectNameSingular;
};

export const findActivitiesOperationSignatureFactory: RecordGqlOperationSignatureFactory<
  FindActivitiesOperationSignatureFactory
> = ({
  objectMetadataItems,
  objectNameSingular,
}: FindActivitiesOperationSignatureFactory) => {
  const body = {
    bodyV2: {
      markdown: true,
      blocknote: true,
    },
  };

  const activityObjectMetadata = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === objectNameSingular,
  );

  const morphJunctionConfig = isDefined(activityObjectMetadata)
    ? getObjectMorphJunctionConfig({
        objectMetadata: activityObjectMetadata,
        objectMetadataItems,
      })
    : null;
  const junctionField = morphJunctionConfig?.junctionField;

  const junctionGqlFields = isDefined(junctionField)
    ? generateJunctionRelationGqlFields({
        fieldMetadataItem: junctionField,
        objectMetadataItems,
      })
    : null;

  return {
    objectNameSingular: objectNameSingular,
    variables: {},
    fields: {
      id: true,
      __typename: true,
      createdAt: true,
      updatedAt: true,
      author: {
        id: true,
        name: true,
        __typename: true,
      },
      // Deprecated: Use createdBy instead
      authorId: true,
      createdBy: {
        source: true,
        workspaceMemberId: true,
        name: true,
      },
      assigneeId: true,
      assignee: {
        id: true,
        name: true,
        __typename: true,
      },
      comments: true,
      attachments: true,
      ...body,
      title: true,
      status: true,
      dueAt: true,
      reminderAt: true,
      type: true,
      ...(isDefined(junctionField) && isDefined(junctionGqlFields)
        ? {
            [junctionField.name]: {
              __typename: true,
              createdAt: true,
              updatedAt: true,
              deletedAt: true,
              ...junctionGqlFields,
            },
          }
        : {}),
    },
  };
};
