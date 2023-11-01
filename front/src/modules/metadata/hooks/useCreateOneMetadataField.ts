import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { FieldType } from '@/ui/object/field/types/FieldType';
import {
  CreateOneMetadataFieldMutation,
  CreateOneMetadataFieldMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_METADATA_FIELD } from '../graphql/mutations';
import { FIND_MANY_METADATA_OBJECTS } from '../graphql/queries';

import { useApolloMetadataClient } from './useApolloMetadataClient';

type CreateOneMetadataFieldArgs =
  CreateOneMetadataFieldMutationVariables['input']['field'] & {
    type: FieldType;
  };

export const useCreateOneMetadataField = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    CreateOneMetadataFieldMutation,
    CreateOneMetadataFieldMutationVariables
  >(CREATE_ONE_METADATA_FIELD, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const createOneMetadataField = async (input: CreateOneMetadataFieldArgs) => {
    return await mutate({
      variables: {
        input: {
          field: {
            ...input,
          },
        },
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(FIND_MANY_METADATA_OBJECTS) ?? ''],
    });
  };

  return {
    createOneMetadataField,
  };
};
