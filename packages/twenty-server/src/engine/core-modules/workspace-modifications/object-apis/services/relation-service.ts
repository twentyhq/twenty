import { mutations } from '../mutations/mutations';
import { RelationInput } from '../types/types';
import { executeQuery } from '../utils/graphqlClient';

export async function createRelations(fieldRelations:RelationInput[] , apiToken: string) {
    // console.log("objectsNameIdMap", objectsNameIdMap);
    for (const item of fieldRelations) {
        const input = {
            relation: {
                fromObjectMetadataId: item?.relation?.fromObjectMetadataId,  // Required!
                toObjectMetadataId: item?.relation?.toObjectMetadataId,      // Required!
                relationType: item?.relation?.relationType,
                fromName: item?.relation?.fromName,
                toName: item?.relation?.toName,
                fromDescription: item?.relation?.fromDescription,
                toDescription: item?.relation?.toDescription,
                fromLabel: item?.relation?.fromLabel,
                toLabel: item?.relation?.toLabel,
                fromIcon: item?.relation?.fromIcon,
                toIcon: item?.relation?.toIcon
            }
        };

        const mutation = {
            query: mutations.createRelation,
            variables: { input }
        };

        await new Promise(resolve => setTimeout(resolve, 300));
        try {
            const responseObj = await executeQuery(mutation.query, mutation.variables, apiToken);
            console.log("Relations responseObj in obj:::", responseObj);
            console.log("Relations variables in obj:::", mutation.variables);
        } catch (error) {
            console.log('Error creating relation:', error);
        }
    }
}
