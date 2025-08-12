import { Injectable, Logger } from '@nestjs/common';

import { type ToolSet } from 'ai';

import { type CreateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-step-input.dto';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { WorkflowVersionEdgeWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.workspace-service';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';
import { WorkflowVersionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.workspace-service';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';

@Injectable()
export class WorkflowToolService {
  private readonly logger = new Logger(WorkflowToolService.name);

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
      parameters: {
        type: 'object',
        properties: {
          input: {
            type: 'object',
            properties: {
              workflowVersionId: {
                type: 'string',
                description:
                  'The ID of the workflow version to add the step to',
              },
              stepType: {
                type: 'string',
                description:
                  'The type of step to create (e.g., "CREATE_RECORD", "SEND_EMAIL", "AI_AGENT", "CODE", "HTTP_REQUEST", "FORM", "FILTER")',
                enum: Object.values(WorkflowActionType),
              },
              parentStepId: {
                type: 'string',
                description:
                  'Optional ID of the parent step this step should come after',
              },
              nextStepId: {
                type: 'string',
                description:
                  'Optional ID of the step this new step should connect to',
              },
              position: {
                type: 'object',
                description: 'Optional position coordinates for the step',
                properties: {
                  x: { type: 'number' },
                  y: { type: 'number' },
                },
              },
            },
            required: ['workflowVersionId', 'stepType'],
          },
        },
        required: ['input'],
      },
      execute: async (parameters: {
        input: CreateWorkflowVersionStepInput;
      }) => {
        try {
          this.logger.log(
            `Creating workflow version step: ${parameters.input.stepType}`,
          );

          return await this.workflowVersionStepService.createWorkflowVersionStep(
            {
              workspaceId,
              input: parameters.input,
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
      parameters: {
        type: 'object',
        properties: {
          input: {
            type: 'object',
            properties: {
              workflowVersionId: {
                type: 'string',
                description:
                  'The ID of the workflow version containing the step',
              },
              step: {
                type: 'object',
                description: 'The updated step configuration',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  type: { type: 'string' },
                  settings: { type: 'object' },
                  position: {
                    type: 'object',
                    properties: {
                      x: { type: 'number' },
                      y: { type: 'number' },
                    },
                  },
                  valid: { type: 'boolean' },
                  nextStepIds: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
                required: ['id'],
              },
            },
            required: ['workflowVersionId', 'step'],
          },
        },
        required: ['input'],
      },
      execute: async (parameters: { input: any }) => {
        try {
          this.logger.log(
            `Updating workflow version step: ${parameters.input.step.id}`,
          );

          return await this.workflowVersionStepService.updateWorkflowVersionStep(
            {
              workspaceId,
              workflowVersionId: parameters.input.workflowVersionId,
              step: parameters.input.step,
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
        'Delete a step from a workflow version. This removes the step and any connections to it.',
      parameters: {
        type: 'object',
        properties: {
          input: {
            type: 'object',
            properties: {
              workflowVersionId: {
                type: 'string',
                description:
                  'The ID of the workflow version containing the step',
              },
              stepId: {
                type: 'string',
                description: 'The ID of the step to delete',
              },
            },
            required: ['workflowVersionId', 'stepId'],
          },
        },
        required: ['input'],
      },
      execute: async (parameters: { input: any }) => {
        try {
          this.logger.log(
            `Deleting workflow version step: ${parameters.input.stepId}`,
          );

          return await this.workflowVersionStepService.deleteWorkflowVersionStep(
            {
              workspaceId,
              workflowVersionId: parameters.input.workflowVersionId,
              stepIdToDelete: parameters.input.stepId,
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

    tools.submit_form_step = {
      description:
        'Submit a response for a form step in a workflow run. This processes user input for form steps.',
      parameters: {
        type: 'object',
        properties: {
          input: {
            type: 'object',
            properties: {
              stepId: {
                type: 'string',
                description: 'The ID of the form step',
              },
              workflowRunId: {
                type: 'string',
                description: 'The ID of the workflow run',
              },
              response: {
                type: 'object',
                description: 'The form response data',
              },
            },
            required: ['stepId', 'workflowRunId', 'response'],
          },
        },
        required: ['input'],
      },
      execute: async (parameters: { input: any }) => {
        try {
          this.logger.log(`Submitting form step: ${parameters.input.stepId}`);

          return await this.workflowVersionStepService.submitFormStep({
            workspaceId,
            stepId: parameters.input.stepId,
            workflowRunId: parameters.input.workflowRunId,
            response: parameters.input.response,
          });
        } catch (error) {
          this.logger.error(`Failed to submit form step: ${error.message}`);
          throw error;
        }
      },
    };

    tools.create_workflow_version_edge = {
      description:
        'Create a connection between two steps in a workflow version. This connects the source step to the target step.',
      parameters: {
        type: 'object',
        properties: {
          input: {
            type: 'object',
            properties: {
              source: {
                type: 'string',
                description:
                  'The ID of the source step (or "trigger" for workflow trigger)',
              },
              target: {
                type: 'string',
                description: 'The ID of the target step to connect to',
              },
              workflowVersionId: {
                type: 'string',
                description: 'The ID of the workflow version',
              },
            },
            required: ['source', 'target', 'workflowVersionId'],
          },
        },
        required: ['input'],
      },
      execute: async (parameters: { input: any }) => {
        try {
          this.logger.log(
            `Creating workflow version edge: ${parameters.input.source} -> ${parameters.input.target}`,
          );

          return await this.workflowVersionEdgeService.createWorkflowVersionEdge(
            {
              source: parameters.input.source,
              target: parameters.input.target,
              workflowVersionId: parameters.input.workflowVersionId,
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
      description:
        'Remove a connection between two steps in a workflow version. This disconnects the source step from the target step.',
      parameters: {
        type: 'object',
        properties: {
          input: {
            type: 'object',
            properties: {
              source: {
                type: 'string',
                description:
                  'The ID of the source step (or "trigger" for workflow trigger)',
              },
              target: {
                type: 'string',
                description: 'The ID of the target step to disconnect from',
              },
              workflowVersionId: {
                type: 'string',
                description: 'The ID of the workflow version',
              },
            },
            required: ['source', 'target', 'workflowVersionId'],
          },
        },
        required: ['input'],
      },
      execute: async (parameters: { input: any }) => {
        try {
          this.logger.log(
            `Deleting workflow version edge: ${parameters.input.source} -> ${parameters.input.target}`,
          );

          return await this.workflowVersionEdgeService.deleteWorkflowVersionEdge(
            {
              source: parameters.input.source,
              target: parameters.input.target,
              workflowVersionId: parameters.input.workflowVersionId,
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
        'Create a new draft version from an existing workflow version. This copies the workflow structure to a new draft.',
      parameters: {
        type: 'object',
        properties: {
          input: {
            type: 'object',
            properties: {
              workflowId: {
                type: 'string',
                description: 'The ID of the workflow',
              },
              workflowVersionIdToCopy: {
                type: 'string',
                description: 'The ID of the workflow version to copy from',
              },
            },
            required: ['workflowId', 'workflowVersionIdToCopy'],
          },
        },
        required: ['input'],
      },
      execute: async (parameters: { input: any }) => {
        try {
          this.logger.log(
            `Creating draft from workflow version: ${parameters.input.workflowVersionIdToCopy}`,
          );

          return await this.workflowVersionService.createDraftFromWorkflowVersion(
            {
              workspaceId,
              workflowId: parameters.input.workflowId,
              workflowVersionIdToCopy: parameters.input.workflowVersionIdToCopy,
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
        'Update the positions of steps and trigger in a workflow version. This modifies the visual layout of the workflow.',
      parameters: {
        type: 'object',
        properties: {
          input: {
            type: 'object',
            properties: {
              workflowVersionId: {
                type: 'string',
                description: 'The ID of the workflow version',
              },
              positions: {
                type: 'array',
                description: 'Array of position updates for steps and trigger',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    position: {
                      type: 'object',
                      properties: {
                        x: { type: 'number' },
                        y: { type: 'number' },
                      },
                    },
                  },
                  required: ['id', 'position'],
                },
              },
            },
            required: ['workflowVersionId', 'positions'],
          },
        },
        required: ['input'],
      },
      execute: async (parameters: { input: any }) => {
        try {
          this.logger.log(
            `Updating workflow version positions: ${parameters.input.workflowVersionId}`,
          );

          return await this.workflowVersionService.updateWorkflowVersionPositions(
            {
              workflowVersionId: parameters.input.workflowVersionId,
              positions: parameters.input.positions,
              workspaceId,
            },
          );
        } catch (error) {
          this.logger.error(
            `Failed to update workflow version positions: ${error.message}`,
          );
          throw error;
        }
      },
    };

    tools.activate_workflow_version = {
      description:
        'Activate a workflow version. This makes the workflow version active and ready to be triggered.',
      parameters: {
        type: 'object',
        properties: {
          workflowVersionId: {
            type: 'string',
            description: 'The ID of the workflow version to activate',
          },
        },
        required: ['workflowVersionId'],
      },
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
        'Deactivate a workflow version. This makes the workflow version inactive and stops it from being triggered.',
      parameters: {
        type: 'object',
        properties: {
          workflowVersionId: {
            type: 'string',
            description: 'The ID of the workflow version to deactivate',
          },
        },
        required: ['workflowVersionId'],
      },
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
        'Compute the output schema for a workflow step. This determines what data the step will produce.',
      parameters: {
        type: 'object',
        properties: {
          input: {
            type: 'object',
            properties: {
              step: {
                type: 'object',
                description: 'The workflow step configuration',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  type: { type: 'string' },
                  settings: { type: 'object' },
                },
                required: ['id', 'type', 'settings'],
              },
            },
            required: ['step'],
          },
        },
        required: ['input'],
      },
      execute: async (parameters: { input: any }) => {
        try {
          this.logger.log(
            `Computing step output schema: ${parameters.input.step.id}`,
          );

          return await this.workflowSchemaService.computeStepOutputSchema({
            step: parameters.input.step,
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
