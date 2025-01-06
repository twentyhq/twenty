import { mutations } from '../mutations/mutations';
import { FieldInput } from '../types/types';
import { executeQuery } from '../utils/graphqlClient';
export async function createFields(fieldsData:FieldInput[], apiToken: string) {
    console.log("Number of fields to be crated", fieldsData.length);
    for (const item of fieldsData ) {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (!item?.field?.objectMetadataId) {
            console.log('Field objectMetadataId is not defined for item:', item?.field?.name);
        }
        else{
            console.log('Field objectMetadataId is defined for item:', item?.field?.name, "will go and setup the field");
        }
        const input = {
            field: {
                type: item?.field?.type,
                name: item?.field?.name,
                label: item?.field?.label,
                description: item?.field?.description,
                icon: item?.field?.icon,
                objectMetadataId: item?.field?.objectMetadataId,
                options: item?.field?.options
            }
        };
        const mutation = {
            query: mutations.createField,
            variables: { input }
        };
        try {
            console.log('Creating field with input:', JSON.stringify(input, null, 2));
            await executeQuery(mutation.query, mutation.variables, apiToken);
        } catch (error) {
            console.log('Error creating field with input:', JSON.stringify(input, null, 2));
            console.log('Error:', error);
        }
    }
}
