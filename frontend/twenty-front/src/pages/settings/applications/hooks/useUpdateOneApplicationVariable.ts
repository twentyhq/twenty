import { useMutation } from '@apollo/client/react';
import { UpdateOneApplicationVariableDocument } from '~/generated-metadata/graphql';

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
    return await mutate({ variables: { key, value, applicationId } });
  };

  return { updateOneApplicationVariable };
};
