import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { FieldType } from '@/object-record/field/types/FieldType';
import {
  CreateOneFieldMetadataItemMutation,
  CreateOneFieldMetadataItemMutationVariables,
  FieldMetadataType,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_FIELD_METADATA_ITEM } from '../graphql/mutations';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '../graphql/queries';

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
  >(CREATE_ONE_FIELD_METADATA_ITEM, {
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
      refetchQueries: [getOperationName(FIND_MANY_OBJECT_METADATA_ITEMS) ?? ''],
    });
  };

  return {
    createOneFieldMetadataItem,
  };
};
