import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { FieldType } from '@/ui/object/field/types/FieldType';
import { FieldMetadataType } from '~/generated/graphql';
import {
  CreateOneFieldMetadataItemMutation,
  CreateOneFieldMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_METADATA_FIELD } from '../graphql/mutations';
import { FIND_MANY_METADATA_OBJECTS } from '../graphql/queries';

import { useApolloMetadataClient } from './useApolloMetadataClient';

type CreateOneFieldMetadataItemArgs = Omit<
  CreateOneFieldMetadataItemMutationVariables['input']['field'],
  'type'
> & {
  type: FieldType;
};

export const useCreateOneFieldMetadataItem = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    CreateOneFieldMetadataItemMutation,
    CreateOneFieldMetadataItemMutationVariables
  >(CREATE_ONE_METADATA_FIELD, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const createOneFieldMetadataItem = async (
    input: CreateOneFieldMetadataItemArgs,
  ) => {
    return await mutate({
      variables: {
        input: {
          field: {
            ...input,
            type: input.type as FieldMetadataType, // Todo improve typing once we have aligned backend and frontend
          },
        },
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(FIND_MANY_METADATA_OBJECTS) ?? ''],
    });
  };

  return {
    createOneFieldMetadataItem,
  };
};
