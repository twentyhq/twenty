import { generateActivityTargetMorphFieldKeys } from '@/activities/utils/generateActivityTargetMorphFieldKeys';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';

export const findActivitiesOperationSignatureFactory: RecordGqlOperationSignatureFactory =
  ({ objectMetadataItems }: { objectMetadataItems: ObjectMetadataItem[] }) => ({
    objectNameSingular: CoreObjectNameSingular.Activity,
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
      authorId: true,
      assigneeId: true,
      assignee: {
        id: true,
        name: true,
        __typename: true,
      },
      comments: true,
      attachments: true,
      body: true,
      title: true,
      completedAt: true,
      dueAt: true,
      reminderAt: true,
      type: true,
      activityTargets: {
        id: true,
        __typename: true,
        createdAt: true,
        updatedAt: true,
        activity: true,
        activityId: true,
        ...generateActivityTargetMorphFieldKeys(objectMetadataItems),
      },
    },
  });
