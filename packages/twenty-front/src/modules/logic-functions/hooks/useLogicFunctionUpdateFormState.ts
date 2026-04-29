import { useGetOneLogicFunction } from '@/logic-functions/hooks/useGetOneLogicFunction';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  type CronTriggerSettings,
  type DatabaseEventTriggerSettings,
  type HttpRouteTriggerSettings,
} from 'twenty-shared/application';
import { type LogicFunction } from '~/generated-metadata/graphql';
import { useGetLogicFunctionSourceCode } from '@/logic-functions/hooks/useGetLogicFunctionSourceCode';
import { DEFAULT_TOOL_INPUT_SCHEMA } from 'twenty-shared/logic-function';

export type LogicFunctionFormValues = {
  name: string;
  description: string;
  isTool: boolean;
  timeoutSeconds: number;
  sourceHandlerCode: string;
  toolInputSchema?: object;
  cronTriggerSettings: CronTriggerSettings | null;
  databaseEventTriggerSettings: DatabaseEventTriggerSettings | null;
  httpRouteTriggerSettings: HttpRouteTriggerSettings | null;
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
    cronTriggerSettings: null,
    databaseEventTriggerSettings: null,
    httpRouteTriggerSettings: null,
  });

  const { sourceHandlerCode, loading: logicFunctionSourceCodeLoading } =
    useGetLogicFunctionSourceCode({
      logicFunctionId,
    });

  const { logicFunction, loading: logicFunctionLoading } =
    useGetOneLogicFunction({
      id: logicFunctionId,
    });

  useEffect(() => {
    if (isDefined(logicFunction)) {
      setFormValues((prevState) => ({
        ...prevState,
        name: logicFunction.name || '',
        description: logicFunction.description || '',
        isTool: logicFunction.isTool ?? false,
        timeoutSeconds: logicFunction.timeoutSeconds ?? 300,
        toolInputSchema:
          logicFunction.toolInputSchema || DEFAULT_TOOL_INPUT_SCHEMA,
        cronTriggerSettings: logicFunction.cronTriggerSettings ?? null,
        databaseEventTriggerSettings:
          logicFunction.databaseEventTriggerSettings ?? null,
        httpRouteTriggerSettings:
          logicFunction.httpRouteTriggerSettings ?? null,
      }));
    }
  }, [logicFunction]);

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
