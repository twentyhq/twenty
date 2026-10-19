import { v4 } from 'uuid';
import { StepLogicalOperator, ViewFilterOperand } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  WorkflowTriggerType,
  type WorkflowTrigger,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export const buildHandoverWorkflow = ({
  connectedAccountId,
  companyIdFieldId,
  memberIdFieldId,
}: {
  connectedAccountId: string;
  companyIdFieldId: string;
  memberIdFieldId: string;
}) => {
  const filterId = v4();
  const companyId = v4();
  const ownerId = v4();
  const taskId = v4();
  const emailId = v4();
  const groupId = v4();
  const settings = {
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  };
  const trigger: WorkflowTrigger = {
    name: 'A deal is won',
    type: WorkflowTriggerType.DATABASE_EVENT,
    settings: { eventName: 'opportunity.updated', outputSchema: {} },
  };
  const steps: WorkflowAction[] = [
    {
      id: filterId,
      name: 'Stage changed to won',
      type: WorkflowActionType.FILTER,
      valid: true,
      settings: {
        ...settings,
        input: {
          stepFilterGroups: [
            { id: groupId, logicalOperator: StepLogicalOperator.AND },
          ],
          stepFilters: [
            {
              id: v4(),
              type: 'SELECT',
              stepOutputKey: '{{trigger.properties.after.stage}}',
              operand: ViewFilterOperand.IS,
              value: '["CUSTOMER"]',
              stepFilterGroupId: groupId,
            },
            {
              id: v4(),
              type: 'SELECT',
              stepOutputKey: '{{trigger.properties.before.stage}}',
              operand: ViewFilterOperand.IS_NOT,
              value: '["CUSTOMER"]',
              stepFilterGroupId: groupId,
            },
          ],
        },
      },
    },
    {
      id: companyId,
      name: 'Find account',
      type: WorkflowActionType.FIND_RECORDS,
      valid: true,
      settings: {
        ...settings,
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
      id: ownerId,
      name: 'Find account owner',
      type: WorkflowActionType.FIND_RECORDS,
      valid: true,
      settings: {
        ...settings,
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
                value: `["{{${companyId}.first.accountOwnerId}}"]`,
              },
            ],
          },
        },
      },
    },
    {
      id: taskId,
      name: 'Create kickoff task',
      type: WorkflowActionType.CREATE_RECORD,
      valid: true,
      settings: {
        ...settings,
        input: {
          objectName: 'task',
          objectRecord: {
            title: 'Kick off {{trigger.properties.after.name}}',
            status: 'TODO',
            assigneeId: `{{${ownerId}.first.id}}`,
          },
        },
      },
    },
    {
      id: emailId,
      name: 'Email account owner',
      type: WorkflowActionType.SEND_EMAIL,
      valid: true,
      settings: {
        ...settings,
        input: {
          connectedAccountId,
          recipients: { to: `{{${ownerId}.first.userEmail}}` },
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
  const ids = ['trigger', ...steps.map((step) => step.id)];
  return {
    trigger,
    steps,
    edges: ids
      .slice(1)
      .map((target, index) => ({ source: ids[index], target })),
  };
};
