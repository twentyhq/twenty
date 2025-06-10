import { INDEX_FILE_PATH } from '@/serverless-functions/constants/IndexFilePath';
import { getFunctionInputFromSourceCode } from '@/serverless-functions/utils/getFunctionInputFromSourceCode';
import { useGetOneServerlessFunction } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunction';
import { useGetOneServerlessFunctionSourceCode } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunctionSourceCode';
import { serverlessFunctionTestDataFamilyState } from '@/workflow/states/serverlessFunctionTestDataFamilyState';
import { Dispatch, SetStateAction, useState } from 'react';
import { useRecoilState } from 'recoil';
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

export const useServerlessFunctionUpdateFormState = ({
  serverlessFunctionId,
  serverlessFunctionVersion = 'draft',
}: {
  serverlessFunctionId: string;
  serverlessFunctionVersion?: string;
}): {
  formValues: ServerlessFunctionFormValues;
  setFormValues: SetServerlessFunctionFormValues;
  loading: boolean;
} => {
  const [formValues, setFormValues] = useState<ServerlessFunctionFormValues>({
    name: '',
    description: '',
    code: undefined,
  });

  const [serverlessFunctionTestData, setServerlessFunctionTestData] =
    useRecoilState(serverlessFunctionTestDataFamilyState(serverlessFunctionId));

  const { serverlessFunction } = useGetOneServerlessFunction({
    id: serverlessFunctionId,
  });

  const { loading } = useGetOneServerlessFunctionSourceCode({
    id: serverlessFunctionId,
    version: serverlessFunctionVersion,
    onCompleted: async (data: FindOneServerlessFunctionSourceCodeQuery) => {
      const newState = {
        code: data?.getServerlessFunctionSourceCode || undefined,
        name: serverlessFunction?.name || '',
        description: serverlessFunction?.description || '',
      };

      setFormValues((prevState) => ({
        ...prevState,
        ...newState,
      }));

      if (serverlessFunctionTestData.shouldInitInput) {
        const sourceCode =
          data?.getServerlessFunctionSourceCode?.[INDEX_FILE_PATH];

        const functionInput = await getFunctionInputFromSourceCode(sourceCode);

        setServerlessFunctionTestData((prev) => ({
          ...prev,
          input: functionInput,
          shouldInitInput: false,
        }));
      }
    },
  });

  return { formValues, setFormValues, loading };
};
