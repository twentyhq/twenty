import { useGetOneLogicFunction } from '@/settings/logic-functions/hooks/useGetOneLogicFunction';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { type Sources } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type GetOneLogicFunctionQuery } from '~/generated-metadata/graphql';
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
    code: { src: { 'index.ts': '' } },
  });

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

  return {
    formValues,
    setFormValues,
    logicFunction,
    loading: logicFunctionLoading,
  };
};
