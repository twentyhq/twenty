import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { FIND_ONE_CODE_STEP_SOURCE_CODE } from '@/workflow/workflow-steps/workflow-actions/code-action/graphql/queries/findOneCodeStepSourceCode';
import { useQuery } from '@apollo/client';
import { type Sources } from 'twenty-shared/types';
import {
  type FindOneCodeStepSourceCodeQuery,
  type FindOneCodeStepSourceCodeQueryVariables,
} from '~/generated-metadata/graphql';

export const useGetCodeStepCode = ({
  logicFunctionId,
}: {
  logicFunctionId: string;
}): { code: Sources | null; loading: boolean } => {
  const apolloMetadataClient = useApolloCoreClient();
  const { data, loading } = useQuery<
    FindOneCodeStepSourceCodeQuery,
    FindOneCodeStepSourceCodeQueryVariables
  >(FIND_ONE_CODE_STEP_SOURCE_CODE, {
    client: apolloMetadataClient ?? undefined,
    variables: {
      input: { logicFunctionId },
    },
    skip: !logicFunctionId,
  });

  const raw = data?.getCodeStepSourceCode;
  const code =
    raw != null && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Sources)
      : null;

  return { code, loading };
};
