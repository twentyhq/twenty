import { useMutation } from '@apollo/client';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { UPDATE_ONE_APPLICATION_VARIABLE } from '@/application-variables/graphql/mutations/updateOneApplicationVariable';
import {
  type UpdateOneApplicationVariableMutation,
  type UpdateOneApplicationVariableMutationVariables,
} from '~/generated-metadata/graphql';

export const useUpdateOneApplicationVariable = () => {
  const apolloMetadataClient = useApolloCoreClient();
  const [mutate] = useMutation<
    UpdateOneApplicationVariableMutation,
    UpdateOneApplicationVariableMutationVariables
  >(UPDATE_ONE_APPLICATION_VARIABLE, { client: apolloMetadataClient });

  const updateOneApplicationVariable = async ({
    key,
    value,
    applicationId,
  }: {
    key: string;
    value: string;
    applicationId: string;
  }) => {
    return await mutate({ variables: { key, value, applicationId } });
  };

  return { updateOneApplicationVariable };
};
