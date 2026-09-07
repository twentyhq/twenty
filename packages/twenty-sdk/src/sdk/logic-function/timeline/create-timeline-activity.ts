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
};

type CreateTimelineActivityLinkedRecordInput =
  | {
      linkedRecordId: string;
      linkedObjectMetadataUniversalIdentifier: string;
    }
  | {
      linkedRecordId?: never;
      linkedObjectMetadataUniversalIdentifier?: never;
    };

export type CreateTimelineActivityInput = CreateTimelineActivityBaseInput &
  CreateTimelineActivityLinkedRecordInput;

export type CreatedTimelineActivity = {
  id: string;
  timelineActivityTypeId: string;
  timelineActivityTypeSnapshot: TimelineActivityTypeSnapshot;
};

const getObjectMetadataSelection = (universalIdentifiers: string[]) => ({
  __args: {
    paging: {
      first: universalIdentifiers.length,
    },
    filter: {
      universalIdentifier: {
        in: universalIdentifiers,
      },
    },
  },
  edges: {
    node: {
      id: true,
      universalIdentifier: true,
      nameSingular: true,
    },
  },
});

// App code addresses manifest entities by their stable universal identifier;
// the workspace row deliberately stores the installation-specific metadata ID.
export const createTimelineActivity = async ({
  timelineActivityTypeUniversalIdentifier,
  targetObjectUniversalIdentifier,
  linkedObjectMetadataUniversalIdentifier,
  targetRecordId,
  ...input
}: CreateTimelineActivityInput): Promise<CreatedTimelineActivity> => {
  const requiredObjectUniversalIdentifiers = [
    ...new Set(
      [
        targetObjectUniversalIdentifier,
        linkedObjectMetadataUniversalIdentifier,
      ].filter(isDefined),
    ),
  ];
  const metadataClient = new MetadataApiClient();
  const { timelineActivityTypes, objects } = await metadataClient.query({
    timelineActivityTypes: {
      id: true,
      universalIdentifier: true,
      isActive: true,
    },
    objects: getObjectMetadataSelection(requiredObjectUniversalIdentifiers),
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

  if (!timelineActivityType.isActive) {
    throw new Error(
      `Timeline activity type ${timelineActivityTypeUniversalIdentifier} is inactive`,
    );
  }

  const objectMetadataByUniversalIdentifier = new Map(
    objects.edges.map(({ node }) => [node.universalIdentifier, node]),
  );

  const targetObject = objectMetadataByUniversalIdentifier.get(
    targetObjectUniversalIdentifier,
  );

  if (!isDefined(targetObject)) {
    throw new Error(
      `Timeline activity target object ${targetObjectUniversalIdentifier} is not installed`,
    );
  }

  const targetFieldName = `target${capitalize(targetObject.nameSingular)}Id`;
  const linkedObject = isDefined(linkedObjectMetadataUniversalIdentifier)
    ? objectMetadataByUniversalIdentifier.get(
        linkedObjectMetadataUniversalIdentifier,
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
