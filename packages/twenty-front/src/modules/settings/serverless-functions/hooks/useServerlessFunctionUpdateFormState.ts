import { useGetOneServerlessFunction } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunction';
import { useGetOneServerlessFunctionSourceCode } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunctionSourceCode';
import { Dispatch, SetStateAction, useState } from 'react';
import { FindOneServerlessFunctionSourceCodeQuery } from '~/generated-metadata/graphql';

export type ServerlessFunctionNewFormValues = {
  name: string;
  description: string;
};

export type ServerlessFunctionFormValues = ServerlessFunctionNewFormValues & {
  code: { [filePath: string]: string } | undefined;
};

type SetServerlessFunctionFormValues = Dispatch<
  SetStateAction<ServerlessFunctionFormValues>
>;

export const useServerlessFunctionUpdateFormState = (
  serverlessFunctionId: string,
): {
  formValues: ServerlessFunctionFormValues;
  setFormValues: SetServerlessFunctionFormValues;
  loading: boolean;
} => {
  const [formValues, setFormValues] = useState<ServerlessFunctionFormValues>({
    name: '',
    description: '',
    code: undefined,
  });

  const { serverlessFunction } =
    useGetOneServerlessFunction(serverlessFunctionId);

  const { loading } = useGetOneServerlessFunctionSourceCode({
    id: serverlessFunctionId,
    version: 'draft',
    onCompleted: (data: FindOneServerlessFunctionSourceCodeQuery) => {
      const newState = {
        code: data?.getServerlessFunctionSourceCode || undefined,
        name: serverlessFunction?.name || '',
        description: serverlessFunction?.description || '',
      };
      setFormValues((prevState) => ({
        ...prevState,
        ...newState,
      }));
    },
  });

  return { formValues, setFormValues, loading };
};
