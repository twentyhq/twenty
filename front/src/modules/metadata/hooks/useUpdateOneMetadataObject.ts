import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import {
  UpdateOneMetadataObjectMutation,
  UpdateOneMetadataObjectMutationVariables,
} from '~/generated-metadata/graphql';

import { UPDATE_ONE_METADATA_OBJECT } from '../graphql/mutations';
import { FIND_MANY_METADATA_OBJECTS } from '../graphql/queries';

import { useApolloMetadataClient } from './useApolloMetadataClient';
import { useFindManyMetadataObjects } from './useFindManyMetadataObjects';

// TODO: Slice the Apollo store synchronously in the update function instead of subscribing, so we can use update after read in the same function call
export const useUpdateOneMetadataObject = () => {
  const apolloClientMetadata = useApolloMetadataClient();

  const { getMetadataObjectsFromCache } = useFindManyMetadataObjects();

  const [mutate] = useMutation<
    UpdateOneMetadataObjectMutation,
    UpdateOneMetadataObjectMutationVariables
  >(UPDATE_ONE_METADATA_OBJECT, {
    client: apolloClientMetadata ?? undefined,
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
    const metadataObjects = getMetadataObjectsFromCache();

    const foundMetadataObject = metadataObjects.find(
      (metadataObject) => metadataObject.id === idToUpdate,
    );

    if (!foundMetadataObject)
      throw new Error(`Metadata object with id ${idToUpdate} not found`);

    return mutate({
      variables: {
        idToUpdate,
        updatePayload: {
          namePlural: foundMetadataObject.namePlural,
          nameSingular: foundMetadataObject.nameSingular,
          description: foundMetadataObject.description,
          icon: foundMetadataObject.icon,
          isActive: foundMetadataObject.isActive,
          labelPlural: foundMetadataObject.labelPlural,
          labelSingular: foundMetadataObject.labelSingular,
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
