import { useGetOneServerlessFunction } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunction';
import { useGetOneServerlessFunctionSourceCode } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunctionSourceCode';
import { Dispatch, SetStateAction, useState } from 'react';
import { FindOneServerlessFunctionSourceCodeQuery } from '~/generated-metadata/graphql';
import { serverlessFunctionTestDataFamilyState } from '@/workflow/states/serverlessFunctionTestDataFamilyState';
import { useSetRecoilState } from 'recoil';
import { getFunctionInputFromSourceCode } from '@/serverless-functions/utils/getFunctionInputFromSourceCode';
import { INDEX_FILE_PATH } from '@/serverless-functions/constants/IndexFilePath';

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

  const setServerlessFunctionTestData = useSetRecoilState(
    serverlessFunctionTestDataFamilyState(serverlessFunctionId),
  );

  const { serverlessFunction } = useGetOneServerlessFunction({
    id: serverlessFunctionId,
  });

  const { loading } = useGetOneServerlessFunctionSourceCode({
    id: serverlessFunctionId,
    version: serverlessFunctionVersion,
    onCompleted: (data: FindOneServerlessFunctionSourceCodeQuery) => {
      const newState = {
        code: data?.getServerlessFunctionSourceCode || undefined,
        name: serverlessFunction?.name || '',
        description: serverlessFunction?.description || '',
      };
      setFormValues((prevState) => ({
        ...prevState,
        ...newState,
      }));
      const sourceCode =
        data?.getServerlessFunctionSourceCode?.[INDEX_FILE_PATH];
      setServerlessFunctionTestData((prev) => ({
        ...prev,
        input: getFunctionInputFromSourceCode(sourceCode),
      }));
    },
  });

  return { formValues, setFormValues, loading };
};
