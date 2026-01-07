import { flattenSources } from '@/serverless-functions/utils/flattenSources';
import { getFunctionInputFromSourceCode } from '@/serverless-functions/utils/getFunctionInputFromSourceCode';
import { useGetOneServerlessFunction } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunction';
import { useGetOneServerlessFunctionSourceCode } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunctionSourceCode';
import { serverlessFunctionTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/code-action/states/serverlessFunctionTestDataFamilyState';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { useRecoilState } from 'recoil';
import { type Sources } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type FindOneServerlessFunctionSourceCodeQuery,
  type GetOneServerlessFunctionQuery,
} from '~/generated-metadata/graphql';
import { type ServerlessFunction } from '~/generated/graphql';

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
      onCompleted: (data: GetOneServerlessFunctionQuery) => {
        const fn = data?.findOneServerlessFunction;

        if (isDefined(fn)) {
          setFormValues((prevState) => ({
            ...prevState,
            name: fn.name || '',
            description: fn.description || '',
          }));
        }
      },
    });

  const { loading: serverlessFunctionSourceCodeLoading } =
    useGetOneServerlessFunctionSourceCode({
      id: serverlessFunctionId,
      version: serverlessFunctionVersion,
      onCompleted: async (data: FindOneServerlessFunctionSourceCodeQuery) => {
        const code = data?.getServerlessFunctionSourceCode;

        setFormValues((prevState) => ({
          ...prevState,
          code: code || prevState.code,
        }));

        if (serverlessFunctionTestData.shouldInitInput) {
          const flattenedCode = flattenSources(code);

          const sourceCode = flattenedCode.find(
            (flatCode) => flatCode.path === serverlessFunction?.handlerPath,
          );

          if (isDefined(sourceCode)) {
            const functionInput = await getFunctionInputFromSourceCode(
              sourceCode.content,
            );

            setServerlessFunctionTestData((prev) => ({
              ...prev,
              input: functionInput,
              shouldInitInput: false,
            }));
          }
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
