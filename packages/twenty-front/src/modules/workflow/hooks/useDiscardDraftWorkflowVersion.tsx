import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { useApolloClient } from '@apollo/client';

export const useDiscardDraftWorkflowVersion = () => {
  const apolloClient = useApolloClient();

  const { findOneRecordQuery: findOneWorkflowRecordQuery } =
    useFindOneRecordQuery({
      objectNameSingular: CoreObjectNameSingular.Workflow,
    });

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });

  const discardDraftWorkflowVersion = async ({
    workflowId,
    workflowVersionId,
  }: {
    workflowId: string;
    workflowVersionId: string;
  }) => {
    await deleteOneRecord(workflowVersionId);

    await apolloClient.query({
      query: findOneWorkflowRecordQuery,
      variables: {
        objectRecordId: workflowId,
      },
      fetchPolicy: 'network-only',
    });
  };

  return { discardDraftWorkflowVersion };
};
