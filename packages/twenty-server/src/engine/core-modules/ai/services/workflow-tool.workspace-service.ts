import { Injectable, Logger } from '@nestjs/common';

import { type ToolSet } from 'ai';

import type { CreateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-step-input.dto';
import type { UpdateWorkflowVersionPositionsInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-version-positions-input.dto';
import type { UpdateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-version-step-input.dto';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { WorkflowVersionEdgeWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.workspace-service';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';
import { WorkflowVersionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.workspace-service';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
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
      parameters: {
        type: 'object',
        properties: {
          workflowVersionId: {
            type: 'string',
            description: 'The ID of the workflow version to add the step to',
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
      parameters: {
        type: 'object',
        properties: {
          workflowVersionId: {
            type: 'string',
            description: 'The ID of the workflow version containing the step',
          },
          step: {
            type: 'object',
            description: 'The updated step configuration',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              description: { type: 'string' },
              icon: { type: 'string' },
              settings: { type: 'object' },
            },
          },
        },
        required: ['workflowVersionId', 'step'],
      },
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
      parameters: {
        type: 'object',
        properties: {
          workflowVersionId: {
            type: 'string',
            description: 'The ID of the workflow version containing the step',
          },
          stepId: {
            type: 'string',
            description: 'The ID of the step to delete',
          },
        },
        required: ['workflowVersionId', 'stepId'],
      },
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
      parameters: {
        type: 'object',
        properties: {
          workflowVersionId: {
            type: 'string',
            description: 'The ID of the workflow version',
          },
          source: {
            type: 'string',
            description: 'The ID of the source step',
          },
          target: {
            type: 'string',
            description: 'The ID of the target step',
          },
        },
        required: ['workflowVersionId', 'source', 'target'],
      },
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
      parameters: {
        type: 'object',
        properties: {
          workflowVersionId: {
            type: 'string',
            description: 'The ID of the workflow version',
          },
          source: {
            type: 'string',
            description: 'The ID of the source step',
          },
          target: {
            type: 'string',
            description: 'The ID of the target step',
          },
        },
        required: ['workflowVersionId', 'source', 'target'],
      },
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
      parameters: {
        type: 'object',
        properties: {
          workflowId: {
            type: 'string',
            description: 'The ID of the workflow',
          },
          workflowVersionIdToCopy: {
            type: 'string',
            description:
              'The ID of the workflow version to create a draft from',
          },
        },
        required: ['workflowId', 'workflowVersionIdToCopy'],
      },
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
      parameters: {
        type: 'object',
        properties: {
          workflowVersionId: {
            type: 'string',
            description: 'The ID of the workflow version',
          },
          positions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                stepId: { type: 'string' },
                position: {
                  type: 'object',
                  properties: {
                    x: { type: 'number' },
                    y: { type: 'number' },
                  },
                },
              },
            },
            description: 'Array of step positions to update',
          },
        },
        required: ['workflowVersionId', 'positions'],
      },
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
        'Deactivate a workflow version. This makes the workflow version inactive and unavailable for execution.',
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
        'Compute the output schema for a workflow step. This determines what data the step produces. The step parameter must be a valid WorkflowTrigger or WorkflowAction with the correct settings structure for its type.',
      parameters: {
        type: 'object',
        properties: {
          step: {
            type: 'object',
            description:
              'The workflow step configuration (WorkflowTrigger or WorkflowAction)',
            oneOf: [
              {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  type: {
                    type: 'string',
                    enum: ['DATABASE_EVENT', 'MANUAL', 'CRON', 'WEBHOOK'],
                  },
                  settings: {
                    type: 'object',
                    description:
                      'Settings vary by trigger type. See specific trigger type for details.',
                    oneOf: [
                      {
                        type: 'object',
                        description: 'Settings for DATABASE_EVENT trigger type',
                        properties: {
                          eventName: { type: 'string' },
                          input: { type: 'object' },
                          outputSchema: { type: 'object' },
                        },
                        required: ['eventName', 'outputSchema'],
                      },
                      {
                        type: 'object',
                        description: 'Settings for MANUAL trigger type',
                        properties: {
                          input: { type: 'object' },
                          outputSchema: { type: 'object' },
                          objectType: { type: 'string' },
                          icon: { type: 'string' },
                        },
                        required: ['outputSchema'],
                      },
                      {
                        type: 'object',
                        description: 'Settings for CRON trigger type',
                        properties: {
                          type: {
                            type: 'string',
                            enum: ['DAYS', 'HOURS', 'MINUTES', 'CUSTOM'],
                          },
                          schedule: { type: 'object' },
                          pattern: { type: 'string' },
                          input: { type: 'object' },
                          outputSchema: { type: 'object' },
                        },
                        required: ['outputSchema'],
                      },
                      {
                        type: 'object',
                        description: 'Settings for WEBHOOK trigger type',
                        properties: {
                          httpMethod: {
                            type: 'string',
                            enum: ['GET', 'POST'],
                          },
                          authentication: {
                            type: 'string',
                            enum: ['API_KEY', null],
                          },
                          expectedBody: { type: 'object' },
                          input: { type: 'object' },
                          outputSchema: { type: 'object' },
                        },
                        required: ['outputSchema'],
                      },
                    ],
                  },
                  nextStepIds: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  position: {
                    type: 'object',
                    properties: {
                      x: { type: 'number' },
                      y: { type: 'number' },
                    },
                  },
                },
                required: ['id', 'name', 'type', 'settings'],
              },
              {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  type: {
                    type: 'string',
                    enum: [
                      'CODE',
                      'SEND_EMAIL',
                      'CREATE_RECORD',
                      'UPDATE_RECORD',
                      'DELETE_RECORD',
                      'FIND_RECORDS',
                      'FORM',
                      'FILTER',
                      'HTTP_REQUEST',
                      'AI_AGENT',
                    ],
                  },
                  settings: {
                    type: 'object',
                    description:
                      'Settings vary by action type. See specific action type for details.',
                    oneOf: [
                      {
                        type: 'object',
                        description: 'Settings for CODE action type',
                        properties: {
                          input: {
                            type: 'object',
                            properties: {
                              serverlessFunctionId: { type: 'string' },
                              serverlessFunctionVersion: { type: 'string' },
                              serverlessFunctionInput: { type: 'object' },
                            },
                            required: [
                              'serverlessFunctionId',
                              'serverlessFunctionVersion',
                            ],
                          },
                          outputSchema: { type: 'object' },
                          errorHandlingOptions: {
                            type: 'object',
                            properties: {
                              retryOnFailure: {
                                type: 'object',
                                properties: { value: { type: 'boolean' } },
                              },
                              continueOnFailure: {
                                type: 'object',
                                properties: { value: { type: 'boolean' } },
                              },
                            },
                          },
                        },
                        required: [
                          'input',
                          'outputSchema',
                          'errorHandlingOptions',
                        ],
                      },
                      {
                        type: 'object',
                        description: 'Settings for SEND_EMAIL action type',
                        properties: {
                          input: {
                            type: 'object',
                            properties: {
                              connectedAccountId: { type: 'string' },
                              email: { type: 'string' },
                              subject: { type: 'string' },
                              body: { type: 'string' },
                            },
                            required: ['connectedAccountId', 'email'],
                          },
                          outputSchema: { type: 'object' },
                          errorHandlingOptions: {
                            type: 'object',
                            properties: {
                              retryOnFailure: {
                                type: 'object',
                                properties: { value: { type: 'boolean' } },
                              },
                              continueOnFailure: {
                                type: 'object',
                                properties: { value: { type: 'boolean' } },
                              },
                            },
                          },
                        },
                        required: [
                          'input',
                          'outputSchema',
                          'errorHandlingOptions',
                        ],
                      },
                      {
                        type: 'object',
                        description: 'Settings for CREATE_RECORD action type',
                        properties: {
                          input: {
                            type: 'object',
                            properties: {
                              objectName: { type: 'string' },
                              objectRecord: { type: 'object' },
                            },
                            required: ['objectName', 'objectRecord'],
                          },
                          outputSchema: { type: 'object' },
                          errorHandlingOptions: {
                            type: 'object',
                            properties: {
                              retryOnFailure: {
                                type: 'object',
                                properties: { value: { type: 'boolean' } },
                              },
                              continueOnFailure: {
                                type: 'object',
                                properties: { value: { type: 'boolean' } },
                              },
                            },
                          },
                        },
                        required: [
                          'input',
                          'outputSchema',
                          'errorHandlingOptions',
                        ],
                      },
                      {
                        type: 'object',
                        description: 'Settings for UPDATE_RECORD action type',
                        properties: {
                          input: {
                            type: 'object',
                            properties: {
                              objectName: { type: 'string' },
                              objectRecord: { type: 'object' },
                              objectRecordId: { type: 'string' },
                              fieldsToUpdate: {
                                type: 'array',
                                items: { type: 'string' },
                              },
                            },
                            required: [
                              'objectName',
                              'objectRecordId',
                              'fieldsToUpdate',
                            ],
                          },
                          outputSchema: { type: 'object' },
                          errorHandlingOptions: {
                            type: 'object',
                            properties: {
                              retryOnFailure: {
                                type: 'object',
                                properties: { value: { type: 'boolean' } },
                              },
                              continueOnFailure: {
                                type: 'object',
                                properties: { value: { type: 'boolean' } },
                              },
                            },
                          },
                        },
                        required: [
                          'input',
                          'outputSchema',
                          'errorHandlingOptions',
                        ],
                      },
                      {
                        type: 'object',
                        description: 'Settings for DELETE_RECORD action type',
                        properties: {
                          input: {
                            type: 'object',
                            properties: {
                              objectName: { type: 'string' },
                              objectRecordId: { type: 'string' },
                            },
                            required: ['objectName', 'objectRecordId'],
                          },
                          outputSchema: { type: 'object' },
                          errorHandlingOptions: {
                            type: 'object',
                            properties: {
                              retryOnFailure: {
                                type: 'object',
                                properties: { value: { type: 'boolean' } },
                              },
                              continueOnFailure: {
                                type: 'object',
                                properties: { value: { type: 'boolean' } },
                              },
                            },
                          },
                        },
                        required: [
                          'input',
                          'outputSchema',
                          'errorHandlingOptions',
                        ],
                      },
                      {
                        type: 'object',
                        description: 'Settings for FIND_RECORDS action type',
                        properties: {
                          input: {
                            type: 'object',
                            properties: {
                              objectName: { type: 'string' },
                              filter: { type: 'object' },
                              orderBy: { type: 'object' },
                              limit: { type: 'number' },
                            },
                            required: ['objectName'],
                          },
                          outputSchema: { type: 'object' },
                          errorHandlingOptions: {
                            type: 'object',
                            properties: {
                              retryOnFailure: {
                                type: 'object',
                                properties: { value: { type: 'boolean' } },
                              },
                              continueOnFailure: {
                                type: 'object',
                                properties: { value: { type: 'boolean' } },
                              },
                            },
                          },
                        },
                        required: [
                          'input',
                          'outputSchema',
                          'errorHandlingOptions',
                        ],
                      },
                      {
                        type: 'object',
                        description: 'Settings for FORM action type',
                        properties: {
                          input: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                id: { type: 'string' },
                                name: { type: 'string' },
                                label: { type: 'string' },
                                type: { type: 'string' },
                                value: { type: 'object' },
                                placeholder: { type: 'string' },
                                settings: { type: 'object' },
                              },
                              required: ['id', 'name', 'label', 'type'],
                            },
                          },
                          outputSchema: { type: 'object' },
                          errorHandlingOptions: {
                            type: 'object',
                            properties: {
                              retryOnFailure: {
                                type: 'object',
                                properties: { value: { type: 'boolean' } },
                              },
                              continueOnFailure: {
                                type: 'object',
                                properties: { value: { type: 'boolean' } },
                              },
                            },
                          },
                        },
                        required: [
                          'input',
                          'outputSchema',
                          'errorHandlingOptions',
                        ],
                      },
                      {
                        type: 'object',
                        description: 'Settings for FILTER action type',
                        properties: {
                          input: {
                            type: 'object',
                            properties: {
                              stepFilterGroups: {
                                type: 'array',
                                items: { type: 'object' },
                              },
                              stepFilters: {
                                type: 'array',
                                items: { type: 'object' },
                              },
                            },
                          },
                          outputSchema: { type: 'object' },
                          errorHandlingOptions: {
                            type: 'object',
                            properties: {
                              retryOnFailure: {
                                type: 'object',
                                properties: { value: { type: 'boolean' } },
                              },
                              continueOnFailure: {
                                type: 'object',
                                properties: { value: { type: 'boolean' } },
                              },
                            },
                          },
                        },
                        required: [
                          'input',
                          'outputSchema',
                          'errorHandlingOptions',
                        ],
                      },
                      {
                        type: 'object',
                        description: 'Settings for HTTP_REQUEST action type',
                        properties: {
                          input: {
                            type: 'object',
                            properties: {
                              url: { type: 'string' },
                              method: {
                                type: 'string',
                                enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                              },
                              headers: { type: 'object' },
                              body: { type: 'object' },
                            },
                            required: ['url', 'method'],
                          },
                          outputSchema: { type: 'object' },
                          errorHandlingOptions: {
                            type: 'object',
                            properties: {
                              retryOnFailure: {
                                type: 'object',
                                properties: { value: { type: 'boolean' } },
                              },
                              continueOnFailure: {
                                type: 'object',
                                properties: { value: { type: 'boolean' } },
                              },
                            },
                          },
                        },
                        required: [
                          'input',
                          'outputSchema',
                          'errorHandlingOptions',
                        ],
                      },
                      {
                        type: 'object',
                        description: 'Settings for AI_AGENT action type',
                        properties: {
                          input: {
                            type: 'object',
                            properties: {
                              agentId: { type: 'string' },
                              prompt: { type: 'string' },
                            },
                          },
                          outputSchema: { type: 'object' },
                          errorHandlingOptions: {
                            type: 'object',
                            properties: {
                              retryOnFailure: {
                                type: 'object',
                                properties: { value: { type: 'boolean' } },
                              },
                              continueOnFailure: {
                                type: 'object',
                                properties: { value: { type: 'boolean' } },
                              },
                            },
                          },
                        },
                        required: [
                          'input',
                          'outputSchema',
                          'errorHandlingOptions',
                        ],
                      },
                    ],
                  },
                  nextStepIds: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  position: {
                    type: 'object',
                    properties: {
                      x: { type: 'number' },
                      y: { type: 'number' },
                    },
                  },
                  valid: { type: 'boolean' },
                },
                required: ['id', 'name', 'type', 'settings', 'valid'],
              },
            ],
          },
        },
        required: ['step'],
      },
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
