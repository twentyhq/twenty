import { useGetOneLogicFunction } from '@/logic-functions/hooks/useGetOneLogicFunction';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  type FindOneLogicFunctionQuery,
  type LogicFunction,
} from '~/generated-metadata/graphql';
import { useGetLogicFunctionSourceCode } from '@/logic-functions/hooks/useGetLogicFunctionSourceCode';
import { DEFAULT_TOOL_INPUT_SCHEMA } from 'twenty-shared/logic-function';

export type LogicFunctionFormValues = {
  name: string;
  description: string;
  isTool: boolean;
  timeoutSeconds: number;
  sourceHandlerCode: string;
  toolInputSchema?: object;
};

type SetLogicFunctionFormValues = Dispatch<
  SetStateAction<LogicFunctionFormValues>
>;

export const useLogicFunctionUpdateFormState = ({
  logicFunctionId,
}: {
  logicFunctionId: string;
}): {
  formValues: LogicFunctionFormValues;
  logicFunction: LogicFunction | null;
  setFormValues: SetLogicFunctionFormValues;
  loading: boolean;
} => {
  const [formValues, setFormValues] = useState<LogicFunctionFormValues>({
    name: '',
    description: '',
    isTool: false,
    sourceHandlerCode: '',
    timeoutSeconds: 300,
    toolInputSchema: DEFAULT_TOOL_INPUT_SCHEMA,
  });

  const { sourceHandlerCode, loading: logicFunctionSourceCodeLoading } =
    useGetLogicFunctionSourceCode({
      logicFunctionId,
    });

  const { logicFunction, loading: logicFunctionLoading } =
    useGetOneLogicFunction({
      id: logicFunctionId,
      onCompleted: (data: FindOneLogicFunctionQuery) => {
        const fn = data?.findOneLogicFunction;

        if (isDefined(fn)) {
          setFormValues((prevState) => ({
            ...prevState,
            name: fn.name || '',
            description: fn.description || '',
            isTool: fn.isTool ?? false,
            timeoutSeconds: fn.timeoutSeconds ?? 300,
            toolInputSchema: fn.toolInputSchema || DEFAULT_TOOL_INPUT_SCHEMA,
          }));
        }
      },
    });

  useEffect(() => {
    if (isDefined(sourceHandlerCode)) {
      setFormValues((prev) => ({
        ...prev,
        sourceHandlerCode,
      }));
    }
  }, [sourceHandlerCode]);

  return {
    formValues,
    setFormValues,
    logicFunction,
    loading: logicFunctionLoading || logicFunctionSourceCodeLoading,
  };
};
