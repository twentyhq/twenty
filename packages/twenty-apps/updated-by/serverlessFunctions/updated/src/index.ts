import axios from 'axios';
import { type ServerlessFunctionConfig } from 'twenty-sdk/application';

const TWENTY_API_KEY: string = process.env.TWENTY_API_KEY ?? '';
const TWENTY_API_URL: string =
  process.env.TWENTY_API_URL ?? 'https://api.twenty.com';
const objectsNotForUpdate: string[] = [
  'messageParticipants',
  'blocklists',
  'favoriteFolders',
  'calendarEvents',
  'attachments',
  'workflowRuns',
  'workflowAutomatedTriggers',
  'messages',
  'timelineActivities',
  'workflows',
  'calendarChannels',
  'calendarChannelEventAssociations',
  'viewFilters',
  'viewFields',
  'calendarEventParticipants',
  'messageChannels',
  'workspaceMembers',
  'messageFolders',
  'connectedAccounts',
  'viewFilterGroups',
  'noteTargets',
  'views',
  'workflowVersions',
  'taskTargets',
  'viewSorts',
  'messageThreads',
  'favorites',
  'messageChannelMessageAssociations',
  'viewGroups',
];

type TwentyObject = {
  id: string;
  namePlural: string;
};

const fetchAllObjects = async (): Promise<TwentyObject[]> => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    url: `${TWENTY_API_URL}/rest/metadata/objects`,
  };
  const response = await axios.request(options);
  let objects: TwentyObject[] = [];
  const objectsToParse: Record<string, any>[] = response.data.data.objects;
  objectsToParse.forEach((object) => {
    objects.push({ id: object.id, namePlural: object.namePlural });
  });
  return objects;
};

const createUpdatedByField = async (
  twentyObjects: TwentyObject[],
  objectName: string,
): Promise<boolean | undefined> => {
  //@ts-expect-error suppress so compiler won't complain
  const sourceObjectId: string = twentyObjects.find(
    (object: TwentyObject) => object.namePlural === objectName,
  ).id;
  // @ts-expect-error object is in array but compiler doesn't know it
  const targetObjectId: string = twentyObjects.find(
    (object: TwentyObject) => object.namePlural === 'workspaceMembers',
  ).id;
  // taken directly from Network tab
  const GraphQLQuery: string = `mutation CreateOneFieldMetadataItem($input: CreateOneFieldMetadataInput!) {
  createOneField(input: $input) {
    id
    type
    name
    label
    description
    icon
    isCustom
    isActive
    isUnique
    isNullable
    createdAt
    updatedAt
    settings
    defaultValue
    options
    isLabelSyncedWithName
    object {
      id
      __typename
    }
    __typename
  }
}`;

  const variables = {
    input: {
      field: {
        description: 'Shows the person behind newest update',
        icon: 'IconRelationOneToMany',
        label: 'Updated by',
        name: 'updatedBy',
        isLabelSyncedWithName: true,
        objectMetadataId: `${sourceObjectId}`,
        type: 'RELATION',
        relationCreationPayload: {
          type: 'MANY_TO_ONE',
          targetObjectMetadataId: `${targetObjectId}`,
          targetFieldLabel: `Updated by ${objectName}`,
          targetFieldIcon: 'IconUsers',
        },
      },
    },
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    url: `${TWENTY_API_URL}/graphql`,
    data: {
      query: GraphQLQuery,
      variables: variables,
    },
  };
  try {
    const response = await axios.request(options);
    return response.status === 200;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
  }
};

const updateUpdatedByField = async (
  objectName: string,
  workspaceMemberId: string,
  recordId: string,
): Promise<boolean | undefined> => {
  const options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    url: `${TWENTY_API_URL}/rest/${objectName}/${recordId}`,
    data: {
      updatedById: workspaceMemberId,
    },
  };
  try {
    const response = await axios.request(options);
    return response.status === 200;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
  }
};

const helperFinderObjectName = async (
  objectName: string,
  objectId: string,
): Promise<string> => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    url: `${TWENTY_API_URL}/rest/${objectName}/${objectId}`,
  };
  try {
    const response = await axios.request(options);
    return response.status === 200 ? objectName : '';
  } catch (error) {
    return ''; // throwing error will finish process, it's necessary to do it like this
  }
};

const findObjectName = async (
  twentyObjects: TwentyObject[],
  objectId: string,
): Promise<string> => {
  const changeableObjects: string[] = twentyObjects
    .filter((obj) => !objectsNotForUpdate.includes(obj.namePlural))
    .map((obj) => obj.namePlural);

  const results = await Promise.all(
    changeableObjects.map((object) => helperFinderObjectName(object, objectId)),
  );
  for (let i = 0; i < results.length; i++) {
    if (results[i] !== '') {
      return results[i];
    }
  }
  throw new Error('No matching object was found');
};

export const main = async (params: {
  properties: Record<string, any>;
  recordId: string;
  workspaceMemberId: string;
}): Promise<object> => {
  if (TWENTY_API_KEY === '') {
    console.error('You must specify a valid TWENTY_API_KEY');
    return {};
  }
  try {
    const { properties, recordId, workspaceMemberId } = params;
    if (!workspaceMemberId) {
      console.log('Exited as last update was done via API');
      return {};
    }

    if (
      properties.updatedFields?.length === 1 &&
      properties.updatedFields.includes('updatedById')
    ) {
      console.log('Exited as last update was done by serverless function');
      return {}; // if last update was updatedBy field, don't update
    }
    const twentyObjects: TwentyObject[] = await fetchAllObjects();

    // const objectName = properties.after; //TODO: uncomment once object type is exposed in properties
    const objectPluralName: string = await findObjectName(
      twentyObjects,
      recordId,
    );

    if (properties.after.updatedById === undefined) {
      const isFieldCreated: boolean | undefined = await createUpdatedByField(
        twentyObjects,
        objectPluralName,
      );
      if (!isFieldCreated) {
        console.error('Creation of updated by field failed');
        return {};
      }
    }

    const isObjectUpdated: boolean | undefined = await updateUpdatedByField(
      objectPluralName,
      workspaceMemberId,
      recordId,
    );

    if (isObjectUpdated) {
      console.log(
        `Field updatedBy in record ${recordId} in object ${objectPluralName} has been updated`,
      );
      return {};
    }
    throw new Error(
      `Update field updatedBy in record ${recordId} in object ${objectPluralName} has failed!`,
    );
  } catch (error) {
    console.error('Exiting because of error');
    if (axios.isAxiosError(error)) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    return {};
  }
};

export const config: ServerlessFunctionConfig = {
  universalIdentifier: '47005bbc-ed0d-4d04-b53b-e94f5c38656d',
  name: 'updated-by',
  triggers: [
    {
      universalIdentifier: '0b6da7cf-506f-4cb9-b692-a44b08972ba4',
      type: 'databaseEvent',
      eventName: '*.updated',
    },
  ],
};
