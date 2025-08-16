import { Injectable, Logger } from '@nestjs/common';

import { type ToolSet } from 'ai';

import type { CreateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-step-input.dto';
import type { UpdateWorkflowVersionPositionsInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-version-positions-input.dto';
import type { UpdateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-version-step-input.dto';
import {
  activateWorkflowVersionSchema,
  computeStepOutputSchemaSchema,
  createDraftFromWorkflowVersionSchema,
  createWorkflowVersionEdgeSchema,
  createWorkflowVersionStepSchema,
  deactivateWorkflowVersionSchema,
  deleteWorkflowVersionEdgeSchema,
  deleteWorkflowVersionStepSchema,
  updateWorkflowVersionPositionsSchema,
  updateWorkflowVersionStepSchema,
} from 'src/modules/workflow/workflow-builder/schemas/workflow-tool-schemas';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { WorkflowVersionEdgeWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.workspace-service';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';
import { WorkflowVersionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';

@Injectable()
export class WorkflowToolWorkspaceService {
  private readonly logger = new Logger(WorkflowToolWorkspaceService.name);

  constructor(
    private readonly workflowVersionStepService: WorkflowVersionStepWorkspaceService,
    private readonly workflowVersionEdgeService: WorkflowVersionEdgeWorkspaceService,
    private readonly workflowVersionService: WorkflowVersionWorkspaceService,
    private readonly workflowTriggerService: WorkflowTriggerWorkspaceService,
    private readonly workflowSchemaService: WorkflowSchemaWorkspaceService,
  ) {}

  generateWorkflowTools(workspaceId: string): ToolSet {
    const tools: ToolSet = {};

    tools.create_workflow_version_step = {
      description:
        'Create a new step in a workflow version. This adds a step to the specified workflow version with the given configuration.',
      parameters: createWorkflowVersionStepSchema,
      execute: async (parameters: CreateWorkflowVersionStepInput) => {
        try {
          this.logger.log(
            `Creating workflow version step: ${parameters.stepType}`,
          );

          return await this.workflowVersionStepService.createWorkflowVersionStep(
            {
              workspaceId,
              input: parameters,
            },
          );
        } catch (error) {
          this.logger.error(
            `Failed to create workflow version step: ${error.message}`,
          );
          throw error;
        }
      },
    };

    tools.update_workflow_version_step = {
      description:
        'Update an existing step in a workflow version. This modifies the step configuration.',
      parameters: updateWorkflowVersionStepSchema,
      execute: async (parameters: UpdateWorkflowVersionStepInput) => {
        try {
          this.logger.log(
            `Updating workflow version step: ${parameters.step.id}`,
          );

          return await this.workflowVersionStepService.updateWorkflowVersionStep(
            {
              workspaceId,
              workflowVersionId: parameters.workflowVersionId,
              step: parameters.step,
            },
          );
        } catch (error) {
          this.logger.error(
            `Failed to update workflow version step: ${error.message}`,
          );
          throw error;
        }
      },
    };

    tools.delete_workflow_version_step = {
      description:
        'Delete a step from a workflow version. This removes the step and updates the workflow structure.',
      parameters: deleteWorkflowVersionStepSchema,
      execute: async (parameters: {
        workflowVersionId: string;
        stepId: string;
      }) => {
        try {
          this.logger.log(
            `Deleting workflow version step: ${parameters.stepId}`,
          );

          return await this.workflowVersionStepService.deleteWorkflowVersionStep(
            {
              workspaceId,
              workflowVersionId: parameters.workflowVersionId,
              stepIdToDelete: parameters.stepId,
            },
          );
        } catch (error) {
          this.logger.error(
            `Failed to delete workflow version step: ${error.message}`,
          );
          throw error;
        }
      },
    };

    tools.create_workflow_version_edge = {
      description:
        'Create a connection (edge) between two workflow steps. This defines the flow between steps.',
      parameters: createWorkflowVersionEdgeSchema,
      execute: async (parameters: {
        workflowVersionId: string;
        source: string;
        target: string;
      }) => {
        try {
          this.logger.log(
            `Creating workflow version edge from ${parameters.source} to ${parameters.target}`,
          );

          return await this.workflowVersionEdgeService.createWorkflowVersionEdge(
            {
              source: parameters.source,
              target: parameters.target,
              workflowVersionId: parameters.workflowVersionId,
              workspaceId,
            },
          );
        } catch (error) {
          this.logger.error(
            `Failed to create workflow version edge: ${error.message}`,
          );
          throw error;
        }
      },
    };

    tools.delete_workflow_version_edge = {
      description: 'Delete a connection (edge) between workflow steps.',
      parameters: deleteWorkflowVersionEdgeSchema,
      execute: async (parameters: {
        workflowVersionId: string;
        source: string;
        target: string;
      }) => {
        try {
          this.logger.log(
            `Deleting workflow version edge from ${parameters.source} to ${parameters.target}`,
          );

          return await this.workflowVersionEdgeService.deleteWorkflowVersionEdge(
            {
              source: parameters.source,
              target: parameters.target,
              workflowVersionId: parameters.workflowVersionId,
              workspaceId,
            },
          );
        } catch (error) {
          this.logger.error(
            `Failed to delete workflow version edge: ${error.message}`,
          );
          throw error;
        }
      },
    };

    tools.create_draft_from_workflow_version = {
      description:
        'Create a new draft workflow version from an existing one. This allows for iterative workflow development.',
      parameters: createDraftFromWorkflowVersionSchema,
      execute: async (parameters: {
        workflowId: string;
        workflowVersionIdToCopy: string;
      }) => {
        try {
          this.logger.log(
            `Creating draft from workflow version: ${parameters.workflowVersionIdToCopy}`,
          );

          return await this.workflowVersionService.createDraftFromWorkflowVersion(
            {
              workspaceId,
              workflowId: parameters.workflowId,
              workflowVersionIdToCopy: parameters.workflowVersionIdToCopy,
            },
          );
        } catch (error) {
          this.logger.error(
            `Failed to create draft from workflow version: ${error.message}`,
          );
          throw error;
        }
      },
    };

    tools.update_workflow_version_positions = {
      description:
        'Update the positions of multiple workflow steps. This is useful for reorganizing the workflow layout.',
      parameters: updateWorkflowVersionPositionsSchema,
      execute: async (parameters: UpdateWorkflowVersionPositionsInput) => {
        try {
          this.logger.log(
            `Updating workflow version step positions for version: ${parameters.workflowVersionId}`,
          );

          return await this.workflowVersionService.updateWorkflowVersionPositions(
            {
              workflowVersionId: parameters.workflowVersionId,
              positions: parameters.positions,
              workspaceId,
            },
          );
        } catch (error) {
          this.logger.error(
            `Failed to update workflow version step positions: ${error.message}`,
          );
          throw error;
        }
      },
    };

    tools.activate_workflow_version = {
      description:
        'Activate a workflow version. This makes the workflow version active and available for execution.',
      parameters: activateWorkflowVersionSchema,
      execute: async (parameters: { workflowVersionId: string }) => {
        try {
          this.logger.log(
            `Activating workflow version: ${parameters.workflowVersionId}`,
          );

          return await this.workflowTriggerService.activateWorkflowVersion(
            parameters.workflowVersionId,
          );
        } catch (error) {
          this.logger.error(
            `Failed to activate workflow version: ${error.message}`,
          );
          throw error;
        }
      },
    };

    tools.deactivate_workflow_version = {
      description:
        'Deactivate a workflow version. This makes the workflow version inactive and unavailable for execution.',
      parameters: deactivateWorkflowVersionSchema,
      execute: async (parameters: { workflowVersionId: string }) => {
        try {
          this.logger.log(
            `Deactivating workflow version: ${parameters.workflowVersionId}`,
          );

          return await this.workflowTriggerService.deactivateWorkflowVersion(
            parameters.workflowVersionId,
          );
        } catch (error) {
          this.logger.error(
            `Failed to deactivate workflow version: ${error.message}`,
          );
          throw error;
        }
      },
    };

    tools.compute_step_output_schema = {
      description:
        'Compute the output schema for a workflow step. This determines what data the step produces. The step parameter must be a valid WorkflowTrigger or WorkflowAction with the correct settings structure for its type.',
      parameters: computeStepOutputSchemaSchema,
      execute: async (parameters: {
        step: WorkflowTrigger | WorkflowAction;
      }) => {
        try {
          return await this.workflowSchemaService.computeStepOutputSchema({
            step: parameters.step,
            workspaceId,
          });
        } catch (error) {
          this.logger.error(
            `Failed to compute step output schema: ${error.message}`,
          );
          throw error;
        }
      },
    };

    return tools;
  }
}
