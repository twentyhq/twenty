import { INDEX_FILE_NAME } from '@/serverless-functions/constants/IndexFileName';
import { getFunctionInputFromSourceCode } from '@/serverless-functions/utils/getFunctionInputFromSourceCode';
import { useGetOneServerlessFunction } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunction';
import { useGetOneServerlessFunctionSourceCode } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunctionSourceCode';
import { serverlessFunctionTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/code-action/states/serverlessFunctionTestDataFamilyState';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { useRecoilState } from 'recoil';
import { type FindOneServerlessFunctionSourceCodeQuery } from '~/generated-metadata/graphql';
import { SOURCE_FOLDER_NAME } from '@/serverless-functions/constants/SourceFolderName';
import { type ServerlessFunction } from '~/generated/graphql';
import { type Sources } from '@/serverless-functions/types/sources.type';

export type ServerlessFunctionNewFormValues = {
  name: string;
  description: string;
};

export type ServerlessFunctionFormValues = ServerlessFunctionNewFormValues & {
  code: Sources;
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
  serverlessFunction: ServerlessFunction | null;
  setFormValues: SetServerlessFunctionFormValues;
  loading: boolean;
} => {
  const [formValues, setFormValues] = useState<ServerlessFunctionFormValues>({
    name: '',
    description: '',
    code: { src: { 'index.ts': '' } },
  });

  const [serverlessFunctionTestData, setServerlessFunctionTestData] =
    useRecoilState(serverlessFunctionTestDataFamilyState(serverlessFunctionId));

  const { serverlessFunction, loading: serverlessFunctionLoading } =
    useGetOneServerlessFunction({
      id: serverlessFunctionId,
    });

  const { loading: serverlessFunctionSourceCodeLoading } =
    useGetOneServerlessFunctionSourceCode({
      id: serverlessFunctionId,
      version: serverlessFunctionVersion,
      onCompleted: async (data: FindOneServerlessFunctionSourceCodeQuery) => {
        const code = data?.getServerlessFunctionSourceCode;

        const newState = {
          code: code || undefined,
          name: serverlessFunction?.name || '',
          description: serverlessFunction?.description || '',
        };

        setFormValues((prevState) => ({
          ...prevState,
          ...newState,
        }));

        if (serverlessFunctionTestData.shouldInitInput) {
          const sourceCode =
            data?.getServerlessFunctionSourceCode?.[SOURCE_FOLDER_NAME]?.[
              INDEX_FILE_NAME
            ];

          const functionInput =
            await getFunctionInputFromSourceCode(sourceCode);

          setServerlessFunctionTestData((prev) => ({
            ...prev,
            input: functionInput,
            shouldInitInput: false,
          }));
        }
      },
    });

  return {
    formValues,
    setFormValues,
    serverlessFunction,
    loading: serverlessFunctionSourceCodeLoading || serverlessFunctionLoading,
  };
};
