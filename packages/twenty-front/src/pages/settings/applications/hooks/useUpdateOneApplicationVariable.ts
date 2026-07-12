import { useMutation } from '@apollo/client/react';
import {
  FindOneApplicationForSettingsApplicationDetailsDocument,
  UpdateOneApplicationVariableDocument,
} from '~/generated-metadata/graphql';

export const useUpdateOneApplicationVariable = () => {
  const [mutate] = useMutation(UpdateOneApplicationVariableDocument);

  const updateOneApplicationVariable = async ({
    key,
    value,
    applicationId,
  }: {
    key: string;
    value: string;
    applicationId: string;
  }) => {
    return await mutate({
      variables: { key, value, applicationId },
      refetchQueries: [
        {
          query: FindOneApplicationForSettingsApplicationDetailsDocument,
          variables: { id: applicationId },
        },
      ],
    });
  };

  return { updateOneApplicationVariable };
};
