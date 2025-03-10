import { useStepsOutputSchema } from '@/workflow/hooks/useStepsOutputSchema';
import { WorkflowVersion } from '@/workflow/types/Workflow';
import { useEffect } from 'react';

export const WorkflowVersionOutputSchemaEffect = ({
  workflowVersion,
}: {
  workflowVersion: WorkflowVersion;
}) => {
  const { populateStepsOutputSchema } = useStepsOutputSchema({
    instanceIdFromProps: workflowVersion.id,
  });

  useEffect(() => {
    populateStepsOutputSchema(workflowVersion);
  }, [populateStepsOutputSchema, workflowVersion]);

  return null;
};
