import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useApolloClient } from '@apollo/client';

export const useDeleteOneWorkflowVersion = () => {
  const apolloClient = useApolloClient();
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });

  const deleteOneWorkflowVersion = async ({
    workflowVersionId,
  }: {
    workflowVersionId: string;
  }) => {
    await deleteOneRecord(workflowVersionId);
    await apolloClient.refetchQueries({
      include: ['FindOneWorkflow'],
    });
  };

  return { deleteOneWorkflowVersion };
};
