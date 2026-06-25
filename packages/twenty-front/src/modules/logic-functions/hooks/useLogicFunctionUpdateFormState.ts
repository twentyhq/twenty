import { useGetOneLogicFunction } from '@/logic-functions/hooks/useGetOneLogicFunction';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  type CronTriggerSettings,
  type DatabaseEventTriggerSettings,
  type HttpRouteTriggerSettings,
  type ToolTriggerSettings,
  type WorkflowActionTriggerSettings,
} from 'twenty-shared/application';
import { type LogicFunction } from '~/generated-metadata/graphql';
import { useGetLogicFunctionSourceCode } from '@/logic-functions/hooks/useGetLogicFunctionSourceCode';

export type LogicFunctionFormValues = {
  name: string;
  description: string;
  timeoutSeconds: number;
  sourceHandlerCode: string;
  cronTriggerSettings: CronTriggerSettings | null;
  databaseEventTriggerSettings: DatabaseEventTriggerSettings | null;
  httpRouteTriggerSettings: HttpRouteTriggerSettings | null;
  toolTriggerSettings: ToolTriggerSettings | null;
  workflowActionTriggerSettings: WorkflowActionTriggerSettings | null;
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
    sourceHandlerCode: '',
    timeoutSeconds: 300,
    cronTriggerSettings: null,
    databaseEventTriggerSettings: null,
    httpRouteTriggerSettings: null,
    toolTriggerSettings: null,
    workflowActionTriggerSettings: null,
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
        timeoutSeconds: logicFunction.timeoutSeconds ?? 300,
        cronTriggerSettings: logicFunction.cronTriggerSettings ?? null,
        databaseEventTriggerSettings:
          logicFunction.databaseEventTriggerSettings ?? null,
        httpRouteTriggerSettings:
          logicFunction.httpRouteTriggerSettings ?? null,
        toolTriggerSettings: logicFunction.toolTriggerSettings ?? null,
        workflowActionTriggerSettings:
          logicFunction.workflowActionTriggerSettings ?? null,
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
