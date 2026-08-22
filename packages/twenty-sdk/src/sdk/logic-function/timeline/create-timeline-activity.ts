import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { type TimelineActivityTypeSnapshot } from 'twenty-shared/timeline';

type CreateTimelineActivityBaseInput = {
  timelineActivityTypeUniversalIdentifier: string;
  targetObjectUniversalIdentifier: string;
  targetRecordId: string;
  happensAt?: string;
  properties?: Record<string, unknown>;
  workspaceMemberId?: string;
};

type CreateTimelineActivityLinkedRecordInput =
  | {
      linkedRecordId: string;
      linkedRecordCachedName?: string;
      linkedObjectMetadataUniversalIdentifier: string;
    }
  | {
      linkedRecordId?: never;
      linkedRecordCachedName?: never;
      linkedObjectMetadataUniversalIdentifier?: never;
    };

export type CreateTimelineActivityInput = CreateTimelineActivityBaseInput &
  CreateTimelineActivityLinkedRecordInput;

export type CreatedTimelineActivity = {
  id: string;
  timelineActivityTypeId: string;
  timelineActivityTypeSnapshot: TimelineActivityTypeSnapshot;
};

// App code addresses manifest entities by their stable universal identifier;
// the workspace row deliberately stores the installation-specific metadata ID.
export const createTimelineActivity = async ({
  timelineActivityTypeUniversalIdentifier,
  targetObjectUniversalIdentifier,
  linkedObjectMetadataUniversalIdentifier,
  targetRecordId,
  ...input
}: CreateTimelineActivityInput): Promise<CreatedTimelineActivity> => {
  const metadataClient = new MetadataApiClient();
  const { timelineActivityTypes, objects } = await metadataClient.query({
    timelineActivityTypes: {
      id: true,
      universalIdentifier: true,
    },
    objects: {
      __args: { paging: { first: 1000 }, filter: {} },
      edges: {
        node: {
          id: true,
          universalIdentifier: true,
          nameSingular: true,
        },
      },
    },
  });

  const timelineActivityType = timelineActivityTypes.find(
    ({ universalIdentifier }) =>
      universalIdentifier === timelineActivityTypeUniversalIdentifier,
  );

  if (!isDefined(timelineActivityType)) {
    throw new Error(
      `Timeline activity type ${timelineActivityTypeUniversalIdentifier} is not installed`,
    );
  }

  const targetObject = objects.edges
    .map(({ node }) => node)
    .find(
      ({ universalIdentifier }) =>
        universalIdentifier === targetObjectUniversalIdentifier,
    );

  if (!isDefined(targetObject)) {
    throw new Error(
      `Timeline activity target object ${targetObjectUniversalIdentifier} is not installed`,
    );
  }

  const targetFieldName = `target${capitalize(targetObject.nameSingular)}Id`;
  const linkedObject = isDefined(linkedObjectMetadataUniversalIdentifier)
    ? objects.edges
        .map(({ node }) => node)
        .find(
          ({ universalIdentifier }) =>
            universalIdentifier === linkedObjectMetadataUniversalIdentifier,
        )
    : undefined;

  if (
    isDefined(linkedObjectMetadataUniversalIdentifier) &&
    !isDefined(linkedObject)
  ) {
    throw new Error(
      `Timeline activity linked object ${linkedObjectMetadataUniversalIdentifier} is not installed`,
    );
  }

  const response = await new RestApiClient().post<{
    data: { createTimelineActivity: CreatedTimelineActivity };
  }>('/rest/timelineActivities', {
    ...input,
    timelineActivityTypeId: timelineActivityType.id,
    linkedObjectMetadataId: linkedObject?.id,
    [targetFieldName]: targetRecordId,
  });

  return response.data.createTimelineActivity;
};
