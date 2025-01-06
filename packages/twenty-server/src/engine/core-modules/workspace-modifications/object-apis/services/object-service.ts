import { mutations } from '../mutations/mutations';
import { CreateOneObjectInput } from '../types/types';
import { executeQuery } from '../utils/graphqlClient';

export async function createObjectMetadataItems(apiToken: string, objectCreationArr: CreateOneObjectInput[]) {
    for (const item of objectCreationArr) {
        const input = {
            object: item.object
        };

        const mutation = {
            query: mutations.createObject,
            variables: { input }
        };
        await new Promise(resolve => setTimeout(resolve, 300));
        try {
            await executeQuery(mutation.query, mutation.variables, apiToken);
        } catch (error) {
            console.log('Error creating object:', error);
        }
    }
}

