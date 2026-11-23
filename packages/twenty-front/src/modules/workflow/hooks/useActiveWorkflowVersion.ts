import { isNonEmptyString } from '@sniptt/guards';

import { useCoreWorkflowVersions } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersions';

type UseActiveWorkflowVersionProps = {
  workflowId: string;
};

export const useActiveWorkflowVersion = ({
  workflowId,
}: UseActiveWorkflowVersionProps) => {
  const { coreWorkflowVersions, loading } = useCoreWorkflowVersions(
    isNonEmptyString(workflowId) ? workflowId : undefined,
  );

  return {
    workflowVersion: coreWorkflowVersions.find(
      (version) => version.status === 'ACTIVE',
    ),
    hasDraftVersion: coreWorkflowVersions.some(
      (version) => version.status === 'DRAFT',
    ),
    loading,
  };
};
