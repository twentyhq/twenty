import { executeQuery,executeGraphQLQuery } from '../utils/graphqlClient';
import { mutations } from '../mutations/mutations';
import { arxEnrichments } from '../data/arxEnrichments';

export async function createArxEnrichments(apiToken:string): Promise<void> {

    for (const enrichment of arxEnrichments) {
        try {
            enrichment['name'] = enrichment['modelName'];
            await executeGraphQLQuery(mutations.createArxEnrichments, { 
                input: enrichment 
            }, apiToken);
            console.log(`Created arxe enrichment: ${enrichment.modelName}`);
        } catch (error) {
            console.error(`Error creating arx enrichment ${enrichment.modelName}:`, error);
            throw error;
        }
    }
}

