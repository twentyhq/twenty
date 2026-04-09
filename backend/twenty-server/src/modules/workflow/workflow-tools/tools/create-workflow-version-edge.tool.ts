import { z } from 'zod';

import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-type.enum';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const createWorkflowVersionEdgeSchema = z.object({
  workflowVersionId: z.string().describe('The ID of the workflow version'),
  source: z.string().describe('The ID of the source step'),
  target: z.string().describe('The ID of the target step'),
  sourceConnectionOptions: z
    .object({
      connectedStepType: z.literal(WorkflowActionType.ITERATOR),
      settings: z.object({
        isConnectedToLoop: z.boolean(),
      }),
    })
    .optional()
    .describe('Optional connection options for iterator steps'),
});

type CreateWorkflowVersionEdgeInput = z.infer<
  typeof createWorkflowVersionEdgeSchema
>;

export const createCreateWorkflowVersionEdgeTool = (
  deps: Pick<WorkflowToolDependencies, 'workflowVersionEdgeService'>,
  context: WorkflowToolContext,
) => ({
  name: 'create_workflow_version_edge' as const,
  description:
    'Create a connection (edge) between two workflow steps. This defines the flow between steps.',
  inputSchema: createWorkflowVersionEdgeSchema,
  execute: async (parameters: CreateWorkflowVersionEdgeInput) => {
    try {
      return await deps.workflowVersionEdgeService.createWorkflowVersionEdge({
        source: parameters.source,
        target: parameters.target,
        workflowVersionId: parameters.workflowVersionId,
        workspaceId: context.workspaceId,
        sourceConnectionOptions: parameters.sourceConnectionOptions,
      });
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to create workflow version edge: ${error.message}`,
      };
    }
  },
});
