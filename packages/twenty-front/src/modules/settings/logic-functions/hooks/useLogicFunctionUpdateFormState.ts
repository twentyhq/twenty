import { flattenSources } from '@/logic-functions/utils/flattenSources';
import { getFunctionInputFromSourceCode } from '@/logic-functions/utils/getFunctionInputFromSourceCode';
import { useGetOneLogicFunction } from '@/settings/logic-functions/hooks/useGetOneLogicFunction';
import { useGetOneLogicFunctionSourceCode } from '@/settings/logic-functions/hooks/useGetOneLogicFunctionSourceCode';
import { logicFunctionTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/code-action/states/logicFunctionTestDataFamilyState';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { useRecoilState } from 'recoil';
import { type Sources } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type FindOneLogicFunctionSourceCodeQuery,
  type GetOneLogicFunctionQuery,
} from '~/generated-metadata/graphql';
import { type LogicFunction } from '~/generated/graphql';

export type LogicFunctionNewFormValues = {
  name: string;
  description: string;
};

export type LogicFunctionFormValues = LogicFunctionNewFormValues & {
  code: Sources;
};

type SetLogicFunctionFormValues = Dispatch<
  SetStateAction<LogicFunctionFormValues>
>;

export const useLogicFunctionUpdateFormState = ({
  logicFunctionId,
  logicFunctionVersion = 'draft',
}: {
  logicFunctionId: string;
  logicFunctionVersion?: string;
}): {
  formValues: LogicFunctionFormValues;
  logicFunction: LogicFunction | null;
  setFormValues: SetLogicFunctionFormValues;
  loading: boolean;
} => {
  const [formValues, setFormValues] = useState<LogicFunctionFormValues>({
    name: '',
    description: '',
    code: { src: { 'index.ts': '' } },
  });

  const [logicFunctionTestData, setLogicFunctionTestData] = useRecoilState(
    logicFunctionTestDataFamilyState(logicFunctionId),
  );

  const { logicFunction, loading: logicFunctionLoading } =
    useGetOneLogicFunction({
      id: logicFunctionId,
      onCompleted: (data: GetOneLogicFunctionQuery) => {
        const fn = data?.findOneLogicFunction;

        if (isDefined(fn)) {
          setFormValues((prevState) => ({
            ...prevState,
            name: fn.name || '',
            description: fn.description || '',
          }));
        }
      },
    });

  const { loading: logicFunctionSourceCodeLoading } =
    useGetOneLogicFunctionSourceCode({
      id: logicFunctionId,
      version: logicFunctionVersion,
      onCompleted: async (data: FindOneLogicFunctionSourceCodeQuery) => {
        const code = data?.getLogicFunctionSourceCode;

        setFormValues((prevState) => ({
          ...prevState,
          code: code || prevState.code,
        }));

        if (logicFunctionTestData.shouldInitInput) {
          const flattenedCode = flattenSources(code);

          const sourceCode = flattenedCode.find(
            (flatCode) => flatCode.path === logicFunction?.sourceHandlerPath,
          );

          if (isDefined(sourceCode)) {
            const functionInput = await getFunctionInputFromSourceCode(
              sourceCode.content,
            );

            setLogicFunctionTestData((prev) => ({
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
    logicFunction,
    loading: logicFunctionSourceCodeLoading || logicFunctionLoading,
  };
};
