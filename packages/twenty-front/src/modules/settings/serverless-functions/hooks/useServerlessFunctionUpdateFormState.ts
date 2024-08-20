import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { getFileAbsoluteURI } from '~/utils/file/getFileAbsoluteURI';
import { isDefined } from '~/utils/isDefined';
import { useGetOneServerlessFunction } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunction';

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
  const [isInitialized, setIsInitialized] = useState(false);
  const [formValues, setFormValues] = useState<ServerlessFunctionFormValues>({
    name: '',
    description: '',
    code: '',
  });

  const { serverlessFunction } =
    useGetOneServerlessFunction(serverlessFunctionId);

  useEffect(() => {
    const getFileContent = async () => {
      const resp = await fetch(
        getFileAbsoluteURI(serverlessFunction?.sourceCodeFullPath),
      );
      if (resp.status !== 200) {
        throw new Error('Network response was not ok');
      } else {
        const result = await resp.text();
        const newState = {
          code: result,
          name: serverlessFunction?.name || '',
          description: serverlessFunction?.description || '',
        };
        setFormValues((prevState) => ({
          ...prevState,
          ...newState,
        }));
        setIsInitialized(true);
      }
    };
    if (isDefined(serverlessFunction?.sourceCodeFullPath) && !isInitialized) {
      getFileContent();
    }
  }, [serverlessFunction, setFormValues, isInitialized, setIsInitialized]);

  return [formValues, setFormValues];
};
