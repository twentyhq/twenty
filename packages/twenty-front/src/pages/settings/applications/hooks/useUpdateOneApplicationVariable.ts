import { useUpdateOneApplicationVariableMutation } from '~/generated-metadata/graphql';

export const useUpdateOneApplicationVariable = () => {
  const [mutate] = useUpdateOneApplicationVariableMutation();

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
