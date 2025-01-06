import { executeQuery, executeGraphQLQuery } from '../utils/graphqlClient';
import { mutations } from '../mutations/mutations';
import { generateAIModelData } from '../data/aiModelData';
import { AIModel } from '../types/types.js';

export async function createAIModels(token:string): Promise<string[]> {
    const aiModels = generateAIModelData();
    const createdIds: string[] = [];

    for (const model of aiModels) {
        try {
            const response = await executeGraphQLQuery(mutations.createAIModel, { 
                input: model 
            }, token) as { data: { createAIModel: { id: string } } };
            createdIds.push(response.data.createAIModel.id);
            console.log(`Created AI Model: ${model.name}`);
        } catch (error) {
            console.error(`Error creating AI Model ${model.name}:`, error);
            throw error;
        }
    }

    return createdIds;
}

export async function getAIModelIds(token): Promise<string[]> {
    const response = await executeGraphQLQuery(`
        query AIModels {
            aIModels {
                edges {
                    node {
                        id
                    }
                }
            }
        }
    `, {}, token) as { data: { aIModels: { edges: { node: { id: string } }[] } } };

    return response.data.aIModels.edges.map((edge: any) => edge.node.id);
}