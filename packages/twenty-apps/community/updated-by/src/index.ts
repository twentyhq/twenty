import axios from 'axios';
import { type FunctionConfig } from 'twenty-sdk';

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

const returnWorkspaceMemberObjectId = async (): Promise<string> => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    url: `${TWENTY_API_URL}/rest/metadata/objects`,
  };
  const response = await axios.request(options);
  return response.data.data.objects.find(
    (object: any) => object.namePlural === 'workspaceMembers',
  ).id;
};

const createUpdatedByFieldMetadata = async (
  sourceObjectId: string,
  workspaceMemberObjectId: string,
  objectName: string,
): Promise<boolean | undefined> => {
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
          targetObjectMetadataId: `${workspaceMemberObjectId}`,
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

const updateUpdatedByFieldValue = async (
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

export const main = async (params: {
  properties: Record<string, any>;
  objectMetadata: Record<string, any>;
  recordId: string;
  workspaceMemberId: string;
}): Promise<object> => {
  if (TWENTY_API_KEY === '') {
    console.error('You must specify a valid TWENTY_API_KEY');
    return {};
  }
  try {
    const { properties, objectMetadata, recordId, workspaceMemberId } = params;
    if (objectsNotForUpdate.includes(objectMetadata.namePlural)) {
      console.log(`Updated record belongs to ${objectMetadata.namePlural} immutable system object`);
      return {};
    }

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

    if (properties.after.updatedById === undefined) {
      const workspaceMemberObjectId: string =
        await returnWorkspaceMemberObjectId();

      const isFieldCreated: boolean | undefined = await createUpdatedByFieldMetadata(
        objectMetadata.id,
        workspaceMemberObjectId,
        objectMetadata.namePlural,
      );
      if (!isFieldCreated) {
        console.error(`Creation of updated by field in ${objectMetadata.namePlural} failed`);
        return {};
      }
      else {
        console.log(`Updated by field in ${objectMetadata.namePlural} has been successfully created`);
      }
    }

    const isObjectUpdated: boolean | undefined = await updateUpdatedByFieldValue(
      objectMetadata.namePlural,
      workspaceMemberId,
      recordId,
    );

    if (isObjectUpdated) {
      console.log(
        `Field updatedBy in record ${recordId} in object ${objectMetadata.namePlural} has been updated`,
      );
      return {};
    }
    throw new Error(
      `Update field updatedBy in record ${recordId} in object ${objectMetadata.namePlural} has failed!`,
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

export const config: FunctionConfig = {
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
