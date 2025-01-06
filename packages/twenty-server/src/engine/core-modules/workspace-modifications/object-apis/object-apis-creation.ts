import axios from 'axios';
import { objectCreationArr } from 'src/engine/core-modules/workspace-modifications/object-apis/data/objectsData.js';
import { createObjectMetadataItems } from 'src/engine/core-modules/workspace-modifications/object-apis/services/object-service.js';
import { WorkspaceQueryService } from '../workspace-modifications.service.js';
import { getFieldsData } from './data/fieldsData';
import { getRelationsData } from './data/relationsData';
import { createAIInterviews, getJobIds } from './services/aiInterviewService';
import { createAIModels } from './services/aiModelService';
import { createArxEnrichments } from './services/arxEnrichmentsService';
import { createFields } from './services/field-service';
import { createRelations } from './services/relation-service';
import { ObjectMetadata, QueryResponse } from './types/types.js';
import { executeQuery } from './utils/graphqlClient.js';

export class CreateMetaDataStructure {

  constructor(
    private readonly workspaceQueryService: WorkspaceQueryService,
  ) {
  }
  async axiosRequest(data: string, apiToken: string) {

    const response = await axios.request({
      method: 'post',
      url: process.env.GRAPHQL_URL,
      headers: {
        authorization: 'Bearer ' + apiToken,
        'content-type': 'application/json',
      },
      data: data,
    });
    return response;
  }

  async fetchFieldsPage(objectId: string, cursor: string | null, apiToken: string) {
    try {
      const response = await executeQuery<any>(
        `
        query ObjectMetadataItems($after: ConnectionCursor, $objectFilter: objectFilter) {
          objects(paging: {first: 100, after: $after}, filter: $objectFilter) {
            edges {
              node {
                id
                nameSingular
                namePlural
                fields(paging: {first: 1000}) {
                  edges {
                    node {
                      name
                      id
                    }
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
        `,
        {
          after: cursor || undefined,
          objectFilter: {
            id: { eq: objectId }
          }
        },  
        apiToken
      );
      
      console.log('fetchFieldsPage response:', response.data);
      return response;
  
    } catch (error) {
      console.error('Error fetching fields page:', error);
      throw error;
    }
  }    
  fetchAllObjects = async (apiToken: string) => {
    const objectsResponse = await executeQuery<QueryResponse<ObjectMetadata>>(
      `
        query ObjectMetadataItems($objectFilter: objectFilter, $fieldFilter: fieldFilter) {
          objects(paging: {first: 1000}, filter: $objectFilter) {
            edges {
              node {
                id
                nameSingular
                namePlural
                labelSingular
                labelPlural
                fields(paging: {first: 1000}, filter: $fieldFilter) {
                  edges {
                    node {
                      name
                      id
                    }
                  }
                }
              }
            }
          }
        }`,
      {},
      apiToken,
    );
    return objectsResponse;
  };

  async fetchObjectsNameIdMap(apiToken: string): Promise<Record<string, string>> {
    const objectsResponse = await this.fetchAllObjects(apiToken);
    console.log('objectsResponse:', objectsResponse);
    console.log("objectsResponse.data.data.objects.edges length", objectsResponse?.data?.objects?.edges?.length);
    const objectsNameIdMap: Record<string, string> = {};
    objectsResponse?.data?.objects?.edges?.forEach(edge => {
      if (edge?.node?.nameSingular && edge?.node?.id) {

        objectsNameIdMap[edge?.node?.nameSingular] = edge?.node?.id;
      }
    });
    console.log('objectsNameIdMap', objectsNameIdMap);
    return objectsNameIdMap;
  }

  async createAndUpdateWorkspaceMember(apiToken: string) {


    const currentWorkspaceMemberResponse = await this.axiosRequest(
      JSON.stringify({
      operationName: 'FindManyWorkspaceMembers',
      variables: {
        limit: 60,
        orderBy: [{ createdAt: 'AscNullsLast' }],
      },
      query: `
        query FindManyWorkspaceMembers($filter: WorkspaceMemberFilterInput, $orderBy: [WorkspaceMemberOrderByInput], $lastCursor: String, $limit: Int) {
          workspaceMembers(
            filter: $filter
            orderBy: $orderBy
            first: $limit
            after: $lastCursor
          ) {
            edges {
              node {
                id
                name {
                  firstName
                  lastName
                }
              }
            }
          }
        }`,
      }),
      apiToken,
    );

    const currentWorkspaceMemberId = currentWorkspaceMemberResponse.data.data.workspaceMembers.edges[0].node.id;
    console.log("currentWorkspaceMemberId", currentWorkspaceMemberResponse.data.data.workspaceMembers.edges[0].node);
    const currentWorkspaceMemberName = currentWorkspaceMemberResponse.data.data.workspaceMembers.edges[0].node.name.firstName + ' ' + currentWorkspaceMemberResponse.data.data.workspaceMembers.edges[0].node.name.lastName;
    const createResponse = await this.axiosRequest(
      JSON.stringify({
        operationName: 'CreateOneWorkspaceMemberType',
        variables: {
          input: {
            typeWorkspaceMember: 'recruiterType',
            name: currentWorkspaceMemberName,
            workspaceMemberId: currentWorkspaceMemberId,
            position: 'first',
          },
        },
        query: `mutation CreateOneWorkspaceMemberType($input: WorkspaceMemberTypeCreateInput!) {
                createWorkspaceMemberType(data: $input) {
                  __typename
                  id
                  workspaceMember {
                    id
                  }
                }
            }`,
      }),
      apiToken,
    );
    console.log('Workpace member created successfully', createResponse.data);
    return currentWorkspaceMemberId;
  }

  async createMetadataStructure(apiToken: string): Promise<void> {
    try {
      console.log('Starting metadata structure creation...');

      await createObjectMetadataItems(apiToken, objectCreationArr);
      console.log('Object metadata items created successfully');
      await new Promise(resolve => setTimeout(resolve, 2000));

      const objectsNameIdMap = await this.fetchObjectsNameIdMap(apiToken);

      const fieldsData = getFieldsData(objectsNameIdMap);

      console.log("Number of fieldsData", fieldsData.length);

      await createFields(fieldsData, apiToken);
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Fields created successfully');
      const relationsFields = getRelationsData(objectsNameIdMap);

      await createRelations(relationsFields, apiToken);
      console.log('Relations created successfully');
      await new Promise(resolve => setTimeout(resolve, 2000));

      const aiModelIds = await createAIModels(apiToken);
      console.log('AI Models created successfully');

      // Get Job IDs
      const jobIds = await getJobIds(apiToken);
      // Create AI Interviews
      await createAIInterviews(aiModelIds, jobIds, apiToken);
      console.log('AI Interviews created successfully');
      await new Promise(resolve => setTimeout(resolve, 2000));

      await createArxEnrichments(apiToken);
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('AI Interviews created successfully');
      console.log('Metadata structure creation completed');

    } catch (error) {
      console.log('Error creating metadata structure:', error);
    }
  }
}
