import {
  workflowActionSchema,
  workflowTriggerSchema,
} from 'twenty-shared/workflow';
import { z } from 'zod';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const computeStepOutputSchemaSchema = z.object({
  step: z
    .union([workflowTriggerSchema, workflowActionSchema])
    .describe('The workflow step configuration'),
  workflowVersionId: z.string().describe('The ID of the workflow version'),
});

export const createComputeStepOutputSchemaTool = (
  deps: Pick<WorkflowToolDependencies, 'workflowSchemaService'>,
  context: WorkflowToolContext,
) => ({
  name: 'compute_step_output_schema' as const,
  description:
    'Compute the output schema for a workflow step. This determines what data the step produces. The step parameter must be a valid WorkflowTrigger or WorkflowAction with the correct settings structure for its type.',
  inputSchema: computeStepOutputSchemaSchema,
  execute: async (parameters: {
    step: WorkflowTrigger | WorkflowAction;
    workflowVersionId: string;
  }) => {
    try {
      return await deps.workflowSchemaService.computeStepOutputSchema({
        step: parameters.step,
        workspaceId: context.workspaceId,
        workflowVersionId: parameters.workflowVersionId,
      });
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to compute step output schema: ${error.message}`,
      };
    }
  },
});
