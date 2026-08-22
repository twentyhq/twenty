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

const OBJECT_METADATA_PAGE_SIZE = 100;

const getObjectMetadataPageSelection = (after?: string) => ({
  __args: {
    paging: {
      first: OBJECT_METADATA_PAGE_SIZE,
      ...(isDefined(after) ? { after } : {}),
    },
    filter: {},
  },
  edges: {
    node: {
      id: true,
      universalIdentifier: true,
      nameSingular: true,
    },
  },
  pageInfo: {
    endCursor: true,
    hasNextPage: true,
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
  const metadataClient = new MetadataApiClient();
  const { timelineActivityTypes, objects: firstObjectsPage } =
    await metadataClient.query({
      timelineActivityTypes: {
        id: true,
        universalIdentifier: true,
      },
      objects: getObjectMetadataPageSelection(),
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

  const requiredObjectUniversalIdentifiers = new Set(
    [
      targetObjectUniversalIdentifier,
      linkedObjectMetadataUniversalIdentifier,
    ].filter(isDefined),
  );
  const objectMetadataByUniversalIdentifier = new Map<
    string,
    { id: string; nameSingular: string }
  >();
  let objectsPage = firstObjectsPage;

  while (true) {
    for (const { node } of objectsPage.edges) {
      if (requiredObjectUniversalIdentifiers.has(node.universalIdentifier)) {
        objectMetadataByUniversalIdentifier.set(node.universalIdentifier, node);
      }
    }

    const foundEveryRequiredObject = [
      ...requiredObjectUniversalIdentifiers,
    ].every((universalIdentifier) =>
      objectMetadataByUniversalIdentifier.has(universalIdentifier),
    );
    const endCursor = objectsPage.pageInfo?.endCursor;

    if (
      foundEveryRequiredObject ||
      !objectsPage.pageInfo?.hasNextPage ||
      !isDefined(endCursor)
    ) {
      break;
    }

    const nextPageResult = await metadataClient.query({
      objects: getObjectMetadataPageSelection(endCursor),
    });

    objectsPage = nextPageResult.objects;
  }

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
