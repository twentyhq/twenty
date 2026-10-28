import { StepLogicalOperator, ViewFilterOperand } from 'twenty-shared/types';
import { TRIGGER_STEP_ID, WorkflowActionType } from 'twenty-shared/workflow';
import { v4 } from 'uuid';

import { type WorkflowVersionEdge } from 'src/modules/workflow/workflow-builder/utils/assemble-workflow-version-content.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type UpdateEventTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';
import {
  type WorkflowDatabaseEventTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export const buildHandoverWorkflow = ({
  connectedAccountId,
  companyIdFieldId,
  memberIdFieldId,
  opportunityStageFieldId,
}: {
  connectedAccountId: string;
  companyIdFieldId: string;
  memberIdFieldId: string;
  opportunityStageFieldId: string;
}): {
  name: string;
  trigger: WorkflowDatabaseEventTrigger & {
    settings: UpdateEventTriggerSettings;
  };
  steps: WorkflowAction[];
  edges: WorkflowVersionEdge[];
} => {
  const companyStepId = v4();
  const ownerStepId = v4();
  const taskStepId = v4();
  const emailStepId = v4();
  const stageFilterGroupId = v4();

  const stepSettings = {
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  };

  const steps: WorkflowAction[] = [
    {
      id: companyStepId,
      name: 'Find account',
      type: WorkflowActionType.FIND_RECORDS,
      valid: true,
      settings: {
        ...stepSettings,
        input: {
          objectName: 'company',
          limit: 1,
          filter: {
            recordFilters: [
              {
                id: v4(),
                fieldMetadataId: companyIdFieldId,
                type: 'UUID',
                operand: ViewFilterOperand.IS,
                value: '["{{trigger.properties.after.companyId}}"]',
              },
            ],
          },
        },
      },
    },
    {
      id: ownerStepId,
      name: 'Find account owner',
      type: WorkflowActionType.FIND_RECORDS,
      valid: true,
      settings: {
        ...stepSettings,
        input: {
          objectName: 'workspaceMember',
          limit: 1,
          filter: {
            recordFilters: [
              {
                id: v4(),
                fieldMetadataId: memberIdFieldId,
                type: 'UUID',
                operand: ViewFilterOperand.IS,
                value: `["{{${companyStepId}.first.accountOwnerId}}"]`,
              },
            ],
          },
        },
      },
    },
    {
      id: taskStepId,
      name: 'Create kickoff task',
      type: WorkflowActionType.CREATE_RECORD,
      valid: true,
      settings: {
        ...stepSettings,
        input: {
          objectName: 'task',
          objectRecord: {
            title: 'Kick off {{trigger.properties.after.name}}',
            status: 'TODO',
            assigneeId: `{{${ownerStepId}.first.id}}`,
          },
        },
      },
    },
    {
      id: emailStepId,
      name: 'Email account owner',
      type: WorkflowActionType.SEND_EMAIL,
      valid: true,
      settings: {
        ...stepSettings,
        input: {
          connectedAccountId,
          recipients: { to: `{{${ownerStepId}.first.userEmail}}` },
          subject: 'Deal won: {{trigger.properties.after.name}}',
          body: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'The deal {{trigger.properties.after.name}} has been won. A kickoff task has been created for you in Twenty.',
                  },
                ],
              },
            ],
          }),
        },
      },
    },
  ];

  return {
    name: 'Hand over won deals',
    trigger: {
      name: 'A deal is won',
      type: WorkflowTriggerType.DATABASE_EVENT,
      settings: {
        eventName: 'opportunity.updated',
        outputSchema: {},
        fields: ['stage'],
        filter: {
          stepFilterGroups: [
            {
              id: stageFilterGroupId,
              logicalOperator: StepLogicalOperator.AND,
            },
          ],
          stepFilters: [
            {
              id: v4(),
              type: 'SELECT',
              stepOutputKey: '{{trigger.properties.after.stage}}',
              operand: ViewFilterOperand.IS,
              value: '["CUSTOMER"]',
              stepFilterGroupId: stageFilterGroupId,
              fieldMetadataId: opportunityStageFieldId,
            },
          ],
        },
      },
    },
    steps,
    edges: [
      { source: TRIGGER_STEP_ID, target: companyStepId },
      { source: companyStepId, target: ownerStepId },
      { source: ownerStepId, target: taskStepId },
      { source: taskStepId, target: emailStepId },
    ],
  };
};
