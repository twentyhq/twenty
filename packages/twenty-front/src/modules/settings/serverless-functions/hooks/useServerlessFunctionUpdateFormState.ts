import { Dispatch, SetStateAction, useState } from 'react';
import { useGetOneServerlessFunction } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunction';
import { useGetOneServerlessFunctionSourceCode } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunctionSourceCode';
import { FindOneServerlessFunctionSourceCodeQuery } from '~/generated-metadata/graphql';

export type ServerlessFunctionNewFormValues = {
  name: string;
  description: string;
};

export type ServerlessFunctionFormValues = ServerlessFunctionNewFormValues & {
  code: string;
};

type SetServerlessFunctionFormValues = Dispatch<
  SetStateAction<ServerlessFunctionFormValues>
>;

export const useServerlessFunctionUpdateFormState = (
  serverlessFunctionId: string,
): [ServerlessFunctionFormValues, SetServerlessFunctionFormValues] => {
  const [formValues, setFormValues] = useState<ServerlessFunctionFormValues>({
    name: '',
    description: '',
    code: '',
  });

  const { serverlessFunction } =
    useGetOneServerlessFunction(serverlessFunctionId);

  useGetOneServerlessFunctionSourceCode({
    id: serverlessFunctionId,
    version: 'draft',
    onCompleted: (data: FindOneServerlessFunctionSourceCodeQuery) => {
      const newState = {
        code: data?.getServerlessFunctionSourceCode || '',
        name: serverlessFunction?.name || '',
        description: serverlessFunction?.description || '',
      };
      setFormValues((prevState) => ({
        ...prevState,
        ...newState,
      }));
    },
  });

  return [formValues, setFormValues];
};
