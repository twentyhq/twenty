import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import {
  UpdateOneMetadataObjectMutation,
  UpdateOneMetadataObjectMutationVariables,
} from '~/generated-metadata/graphql';

import { UPDATE_ONE_METADATA_OBJECT } from '../graphql/mutations';
import { FIND_MANY_METADATA_OBJECTS } from '../graphql/queries';

import { useApolloClientMetadata } from './useApolloClientMetadata';
import { useFindManyMetadataObjects } from './useFindManyMetadataObjects';

export const useUpdateOneMetadataObject = () => {
  const apolloClientMetadata = useApolloClientMetadata();

  const { metadataObjects } = useFindManyMetadataObjects();

  const [mutate] = useMutation<
    UpdateOneMetadataObjectMutation,
    UpdateOneMetadataObjectMutationVariables
  >(UPDATE_ONE_METADATA_OBJECT, {
    client: apolloClientMetadata ?? ({} as ApolloClient<any>),
  });

  const updateOneMetadataObject = ({
    idToUpdate,
    updatePayload,
  }: {
    idToUpdate: UpdateOneMetadataObjectMutationVariables['idToUpdate'];
    updatePayload: Partial<
      Pick<
        UpdateOneMetadataObjectMutationVariables['updatePayload'],
        'description' | 'icon' | 'isActive' | 'labelPlural' | 'labelSingular'
      >
    >;
  }) => {
    const foundMetadataObject = metadataObjects.find(
      (metadataObject) => metadataObject.id === idToUpdate,
    );

    if (!foundMetadataObject)
      throw new Error(`Metadata object with id ${idToUpdate} not found`);

    return mutate({
      variables: {
        idToUpdate,
        updatePayload: {
          ...foundMetadataObject,
          ...updatePayload,
        },
      },
      refetchQueries: [getOperationName(FIND_MANY_METADATA_OBJECTS) ?? ''],
    });
  };

  return {
    updateOneMetadataObject,
  };
};
