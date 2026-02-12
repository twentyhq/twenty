import { useGetOneLogicFunction } from '@/logic-functions/hooks/useGetOneLogicFunction';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  type FindOneLogicFunctionQuery,
  type LogicFunction,
} from '~/generated-metadata/graphql';
import { useGetLogicFunctionSourceCode } from '@/logic-functions/hooks/useGetLogicFunctionSourceCode';

export type LogicFunctionNewFormValues = {
  name: string;
  description: string;
};

export type LogicFunctionFormValues = LogicFunctionNewFormValues & {
  code: string;
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
    code: '',
  });

  const { code: codeFromApi, loading: logicFunctionSourceCodeLoading } =
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
          }));
        }
      },
    });

  useEffect(() => {
    if (isDefined(codeFromApi)) {
      setFormValues((prev) => ({ ...prev, code: codeFromApi }));
    }
  }, [codeFromApi]);

  return {
    formValues,
    setFormValues,
    logicFunction,
    loading: logicFunctionLoading || logicFunctionSourceCodeLoading,
  };
};
