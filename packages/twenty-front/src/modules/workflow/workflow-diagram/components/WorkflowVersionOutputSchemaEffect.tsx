import { usePopulateStepsOutputSchema } from '@/workflow/hooks/usePopulateStepsOutputSchema';
import { WorkflowVersion } from '@/workflow/types/Workflow';
import { useEffect } from 'react';

export const WorkflowVersionOutputSchemaEffect = ({
  workflowVersion,
}: {
  workflowVersion: WorkflowVersion;
}) => {
  const { populateStepsOutputSchema } = usePopulateStepsOutputSchema(
    workflowVersion.id,
  );

  useEffect(() => {
    populateStepsOutputSchema(workflowVersion);
  }, [populateStepsOutputSchema, workflowVersion]);

  return null;
};
