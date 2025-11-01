import axios from 'axios';

const TWENTY_API_KEY: string = process.env.TWENTY_API_KEY !== "" && process.env.TWENTY_API_KEY !== undefined ? process.env.TWENTY_API_KEY : "";
const TWENTY_API_URL: string = process.env.TWENTY_API_URL !== "" && process.env.TWENTY_API_URL !== undefined ? process.env.TWENTY_API_URL : "https://api.twenty.com";
const objectsNotForUpdate: string[] = [
  "messageParticipants",
  "blocklists",
  "favoriteFolders",
  "calendarEvents",
  "attachments",
  "workflowRuns",
  "workflowAutomatedTriggers",
  "messages",
  "timelineActivities",
  "workflows",
  "calendarChannels",
  "calendarChannelEventAssociations",
  "viewFilters",
  "viewFields",
  "calendarEventParticipants",
  "messageChannels",
  "workspaceMembers",
  "messageFolders",
  "connectedAccounts",
  "viewFilterGroups",
  "noteTargets",
  "views",
  "workflowVersions",
  "taskTargets",
  "viewSorts",
  "messageThreads",
  "favorites",
  "messageChannelMessageAssociations",
  "viewGroups"
];

const fetchObjectId = async (objectName: string): Promise<string> => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    url: `${TWENTY_API_URL}/rest/metadata/objects`
  };
  try {
    const response = await axios(options);
    if (response.status === 200) {
      return response.data.data.objects.find(
        (object: any) => object.nameSingular === objectName,
      ).id !== undefined
        ? response.data.data.objects.find(
            (object: any) => object.nameSingular === objectName,
          ).id
        : '';
    }
    return "";
  }
  catch (error) {
    console.error(error);
    return "";
  }
}

const createUpdatedByField = async (objectName: string): Promise<boolean> => {
  const sourceObjectId: string = await fetchObjectId(objectName);
  const targetObjectId: string = await fetchObjectId("workspaceMember");
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
    "input": {
      "field": {
        "description": "",
        "icon": "IconRelationOneToMany",
        "label": "Updated by",
        "name": "updatedBy",
        "isLabelSyncedWithName": true,
        "objectMetadataId": `${sourceObjectId}`,
        "type": "RELATION",
        "relationCreationPayload": {
          "type": "MANY_TO_ONE",
          "targetObjectMetadataId": `${targetObjectId}`,
          "targetFieldLabel": `Updated by ${objectName}`,
          "targetFieldIcon": "IconUsers"
        }
      }
    }
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TWENTY_API_KEY}`
    },
    url: `${TWENTY_API_URL}/graphql`,
    data: {
      query: GraphQLQuery,
      variables: variables
    }
  }
  try {
    const temp = await axios.request(options);
    return temp.status === 200;
  }
  catch (error) {
    console.error(error);
    return false;
  }
}

const updateUpdatedByField = async (objectName: string, userId: string, recordId: string): Promise<boolean> => {
  const options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TWENTY_API_KEY}`
    },
    url: `${TWENTY_API_URL}/rest/${objectName}/${recordId}`,
    data: {
      updatedBy: `${userId}`
    }
  };
  try {
    const response = await axios.request(options);
    return response.status === 200;
  }
  catch (error) {
    console.error(error);
    return false;
  }
}

const helperFinderObjectName = async (objectName: string, objectId: string): Promise<string> => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`
    },
    url: `${TWENTY_API_URL}/rest/${objectName}/${objectId}`,
  }
  try {
    const response = await axios(options);
    return response.status === 200 ? objectName : "";
  }
  catch (error) {
    console.error(error);
    return "";
  }
}

const findObjectName = async (objectId: string): Promise<string> => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`
    },
    url: `${TWENTY_API_URL}/rest/metadata/objects`,
  }
  try {
    const response = await axios.request(options);
    const all_objects: string[] = [];
    response.data.data.objects.forEach((object: any) => {all_objects.push(object.namePlural)});
    const changeable_objects: string[] = all_objects.filter((o) => objectsNotForUpdate.indexOf(o) === -1);
    for (const o of changeable_objects) {
      const temp: string = await helperFinderObjectName(o, objectId);
      if (temp !== '') {
        return temp;
      }
    }
    return "";
  }
  catch (error) {
    console.error(error);
    return "";
  }
}

export const main = async (params: {
  properties: Record<string, any>;
  recordId: string;
  userId: string;
}): Promise<object> => {
  if (TWENTY_API_KEY === "" || TWENTY_API_URL === "") {
    console.error("You must specify a valid TWENTY_API_URL");
    return {};
  }

  const { properties, recordId, userId } = params;

  // const objectName = properties.after; //TODO: uncomment once object type is exposed in properties
  const objectName = await findObjectName(recordId);

  // Check if updated record belongs to an object which shouldn't have a updatedBy field
  // Check if updated record has updatedBy field, if not, create it
  // Check if updated field in record is updatedBy field, if yes, return preemptively
  // Update record with person ID

  if (objectsNotForUpdate.includes(objectName)) {
    return {};
  }

  if (properties.updatedFields.length === 1 && properties.updatedFields.includes("updatedBy")) {
    return {}; // if last update was updatedBy field, don't update
  }

  if (properties.after.updatedBy === undefined) {
    const isFieldCreated: boolean = await createUpdatedByField(objectName);
    if (!isFieldCreated) {
      console.error("Creation of updated by field failed");
      return {};
    }
  }

  const isObjectUpdated = await updateUpdatedByField(objectName, userId, recordId);

  if (isObjectUpdated) {
    console.log(`Field updatedBy in object ${objectName} has been updated`);
  }
  else {
    console.log("Error")
  }
  return {  };
};