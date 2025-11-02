import axios from 'axios';

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

const fetchAllObjects = async (): Promise<Record<string, string>> => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    url: `${TWENTY_API_URL}/rest/metadata/objects`,
  };
  try {
    const response = await axios(options);
    let objects: Record<string, string> = {};
    const objectsToParse: Record<string, any>[] = response.data.data.objects;
    objectsToParse.forEach((object) => {
      objects[object.namePlural] = object.id;
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
  twentyObjects: Record<string, string>,
  objectName: string,
): Promise<boolean> => {
  const sourceObjectId: string = twentyObjects[objectName];
  const targetObjectId: string = twentyObjects['workspaceMembers'];
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
    return "";
  }
};

const findObjectName = async (
  twentyObjects: Record<string, string>,
  objectId: string,
): Promise<string> => {
  const changeable_objects: string[] = Object.keys(twentyObjects).filter(
    (key: string) => objectsNotForUpdate.indexOf(key) === -1,
  );
  console.log(changeable_objects.toString());
    for (const object of changeable_objects) {
      const temp: string = await helperFinderObjectName(object, objectId);
      console.log(temp);
      if (temp !== '') {
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
      properties.updatedFields.includes('updatedBy')
    ) {
      return {}; // if last update was updatedBy field, don't update
    }
    const twentyObjects: Record<string, string> = await fetchAllObjects();

    // const objectName = properties.after; //TODO: uncomment once object type is exposed in properties
    const objectName: string = await findObjectName(twentyObjects, recordId);

    if (properties.after.updatedBy === undefined) {
      const isFieldCreated: boolean = await createUpdatedByField(
        twentyObjects,
        objectName,
      );
      if (!isFieldCreated) {
        console.error('Creation of updated by field failed');
        return {};
      }
    }

    const isObjectUpdated: boolean = await updateUpdatedByField(
      objectName,
      userId,
      recordId,
    );

    if (isObjectUpdated) {
      console.log(`Field updatedBy in object ${objectName} has been updated`);
    }
    return {};
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
