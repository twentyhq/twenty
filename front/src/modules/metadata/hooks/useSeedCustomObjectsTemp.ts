import {
  CreateOneFieldMutation,
  CreateOneFieldMutationVariables,
  CreateOneObjectMutation,
  CreateOneObjectMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_FIELD, CREATE_ONE_OBJECT } from '../graphql/mutations';

import { useApolloClientMetadata } from './useApolloClientMetadata';

export const useSeedCustomObjectsTemp = () => {
  const client = useApolloClientMetadata();

  return async () => {
    if (!client) return;

    const { data: createSuppliersData } = await client?.mutate<
      CreateOneObjectMutation,
      CreateOneObjectMutationVariables
    >({
      mutation: CREATE_ONE_OBJECT,
      variables: {
        input: {
          object: {
            labelPlural: 'Suppliers',
            labelSingular: 'Supplier',
            nameSingular: 'supplier',
            namePlural: 'suppliers',
            description: 'Suppliers',
            icon: 'IconBuilding',
          },
        },
      },
    });

    const supplierObjectId = createSuppliersData?.createOneObject?.id ?? '';

    await client?.mutate<
      CreateOneFieldMutation,
      CreateOneFieldMutationVariables
    >({
      mutation: CREATE_ONE_FIELD,
      variables: {
        input: {
          field: {
            objectId: supplierObjectId,
            label: 'Name',
            name: 'name',
            type: 'text',
            description: 'Name',
            icon: 'IconBuilding',
          },
        },
      },
    });

    await client?.mutate<
      CreateOneFieldMutation,
      CreateOneFieldMutationVariables
    >({
      mutation: CREATE_ONE_FIELD,
      variables: {
        input: {
          field: {
            objectId: supplierObjectId,
            label: 'City',
            name: 'city',
            type: 'text',
            description: 'City',
            icon: 'IconMap',
          },
        },
      },
    });
  };
};
