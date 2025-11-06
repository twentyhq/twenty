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

type twentyObject = {
  id: string;
  nameSingular: string;
  namePlural: string;
}

const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

const fetchAllObjects = async (): Promise<twentyObject[]> => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    url: `${TWENTY_API_URL}/rest/metadata/objects`,
  };
  try {
    const response = await axios(options);
    let objects: twentyObject[] = [];
    const objectsToParse: Record<string, any>[] = response.data.data.objects;
    objectsToParse.forEach((object) => {
      objects.push({id: object.id, nameSingular: object.nameSingular, namePlural: object.namePlural} as twentyObject);
    });
    return objects;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw error;
  }
};

const createUpdatedByField = async (
  twentyObjects: twentyObject[],
  objectName: string,
): Promise<boolean> => {
  //@ts-expect-error suppress so compiler won't complain
  const sourceObjectId: string = twentyObjects.find((object: twentyObject) => object.namePlural === objectName).id;
  // @ts-expect-error object is in array but compiler doesn't know it
  const targetObjectId: string = twentyObjects.find((object: twentyObject) => object.namePlural === 'workspaceMembers').id;
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
        description: '',
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
    throw error;
  }
};

const updateUpdatedByField = async (
  objectSingularName: string, // first letter must be capitalized
  userId: string,
  recordId: string,
): Promise<boolean> => {
  const graphQLQuery = `mutation UpdateOne${objectSingularName}($idToUpdate: UUID!, $input: ${objectSingularName}UpdateInput!) {
  update${objectSingularName}(id: $idToUpdate, data: $input) {
    id
  }
}`;
  const variables = {
    "idToUpdate": recordId,
    "input": {
      "updatedById": userId,
    }
  }; // TODO: find a root cause and fix the request
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    url: `${TWENTY_API_URL}/graphql`,
    data: {
      query: graphQLQuery,
      variables: variables,
    }
  };
  try {
    console.log(graphQLQuery, variables);
    const response = await axios.request(options);
    console.log(response.data);
    return response.data.errors === undefined;
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw error;
  }
}

/*
const updateUpdatedByField = async (
  objectName: string,
  userId: string,
  recordId: string,
): Promise<boolean> => {
  const options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    url: `${TWENTY_API_URL}/rest/${objectName}/${recordId}`,
    data: {
      updatedBy: `${userId}`,
    },
  };
  try {
    const response = await axios.request(options);
    return response.status === 200;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw error;
  }
};
*/

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
    return ""; // throwing error will finish process, it's necessary to do it like this
  }
};

const findObjectName = async (
  twentyObjects: twentyObject[],
  objectId: string,
): Promise<string> => {
  const changeable_objects: string[] = [];
  for (let i = 0; i < twentyObjects.length; i++) {
    if (!objectsNotForUpdate.includes(twentyObjects[i].namePlural)) {
      changeable_objects.push(twentyObjects[i].namePlural);
    }
  }
    for (const object of changeable_objects) {
      const temp: string = await helperFinderObjectName(object, objectId);
      if (temp !== '') {
        console.log(temp);
        return temp;
      }
    }
    return '';
};

export const main = async (params: {
  properties: Record<string, any>;
  recordId: string;
  userId: string;
}): Promise<object> => {
  if (TWENTY_API_KEY === '') {
    console.error('You must specify a valid TWENTY_API_KEY');
    return {};
  }
  try {
    const { properties, recordId, userId } = params;

    if (
      properties.updatedFields?.length === 1 &&
      properties.updatedFields.includes('updatedById')
    ) {
      console.log("Exited as last update was done by serverless function")
      return {}; // if last update was updatedBy field, don't update
    }
    const twentyObjects: twentyObject[] = await fetchAllObjects();

    // const objectName = properties.after; //TODO: uncomment once object type is exposed in properties
    const objectPluralName: string = await findObjectName(twentyObjects, recordId);

    if (properties.after.updatedById === undefined) {
      const isFieldCreated: boolean = await createUpdatedByField(
        twentyObjects,
        objectPluralName,
      );
      if (!isFieldCreated) {
        console.error('Creation of updated by field failed');
        return {};
      }
    }

    // @ts-expect-error object exists but compiler doesn't know
    const objectSingularName: string = twentyObjects.find((object) => object.namePlural === objectPluralName).nameSingular;
    const isObjectUpdated: boolean = await updateUpdatedByField(
      capitalizeFirstLetter(objectSingularName),
      userId,
      recordId,
    );

    if (isObjectUpdated) {
      console.log(`Field updatedBy in object ${objectPluralName} has been updated`);
      return {};
    }
    else {
      throw new Error(`Update field updatedBy in record ${recordId} in object ${objectPluralName} has failed!`);
    }
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
  universalIdentifier: "47005bbc-ed0d-4d04-b53b-e94f5c38656d",
  name: "updated-by",
  triggers: [
    {
      universalIdentifier: "0b6da7cf-506f-4cb9-b692-a44b08972ba4",
      type: "databaseEvent",
      eventName: "*.updated"
    }
  ]
}
