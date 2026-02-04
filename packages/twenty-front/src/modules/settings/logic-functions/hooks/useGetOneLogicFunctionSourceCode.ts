import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { FIND_ONE_CODE_STEP_SOURCE_CODE } from '@/workflow/workflow-steps/workflow-actions/code-action/graphql/queries/findOneCodeStepSourceCode';
import { useQuery } from '@apollo/client';
import {
  type FindOneCodeStepSourceCodeQuery,
  type FindOneCodeStepSourceCodeQueryVariables,
} from '~/generated-metadata/graphql';

export const useGetOneLogicFunctionSourceCode = ({
  id,
  onCompleted,
}: {
  id: string;
  onCompleted?: (data: FindOneCodeStepSourceCodeQuery) => void;
}) => {
  const apolloMetadataClient = useApolloCoreClient();
  const { data, loading } = useQuery<
    FindOneCodeStepSourceCodeQuery,
    FindOneCodeStepSourceCodeQueryVariables
  >(FIND_ONE_CODE_STEP_SOURCE_CODE, {
    client: apolloMetadataClient ?? undefined,
    variables: {
      input: { logicFunctionId: id },
    },
    onCompleted,
    fetchPolicy: 'network-only',
  });
  return { code: data?.getCodeStepSourceCode, loading };
};
