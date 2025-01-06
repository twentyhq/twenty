import { executeQuery,executeGraphQLQuery } from '../utils/graphqlClient';
import { mutations } from '../mutations/mutations';
import { generateAIInterviewData } from '../data/aiInterviewData';
import { AIInterview } from '../types/types';

export async function createAIInterviews(aiModelIds: string[], jobIds: string[], apiToken:string): Promise<void> {
    const aiInterviews = generateAIInterviewData(aiModelIds, jobIds);

    for (const interview of aiInterviews) {
        try {
            await executeGraphQLQuery(mutations.createAIInterview, { 
                input: interview 
            },apiToken);
            console.log(`Created AI Interview: ${interview.name}`);
        } catch (error) {
            console.error(`Error creating AI Interview ${interview.name}:`, error);
            throw error;
        }
    }
}

export async function getJobIds(apiToken: string): Promise<string[]> {
    const response = await executeGraphQLQuery(`
        query Jobs {
            jobs {
                edges {
                    node {
                        id
                    }
                }
            }
        }
    `, {}, apiToken) as { data: { jobs: { edges: { node: { id: string } }[] } } };

    return response.data.jobs.edges.map((edge: any) => edge.node.id);
}