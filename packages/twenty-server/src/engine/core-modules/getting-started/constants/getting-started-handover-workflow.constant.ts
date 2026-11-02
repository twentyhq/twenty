import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { StepLogicalOperator, ViewFilterOperand } from 'twenty-shared/types';

import { type GettingStartedWorkflow } from 'src/engine/core-modules/getting-started/types/getting-started-workflow.type';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

const FIND_ACCOUNT_STEP_UNIVERSAL_IDENTIFIER =
  '19eff5f8-356f-4cf2-a24f-309474f5b54e';
const FIND_ACCOUNT_OWNER_STEP_UNIVERSAL_IDENTIFIER =
  '9e9e0da4-017b-4ed0-be7d-e7c21239599a';
const CREATE_KICKOFF_TASK_STEP_UNIVERSAL_IDENTIFIER =
  '02fc0ba0-64ca-4468-a290-1601d03576f6';
const EMAIL_ACCOUNT_OWNER_STEP_UNIVERSAL_IDENTIFIER =
  '30b080b5-ef02-4092-8f84-2a5f1cd123b9';
const STAGE_FILTER_GROUP_ID = 'd2c2f73a-0622-4215-ac54-7beabcf19792';
const CREATE_KICKOFF_TASK_STEP_TITLE = msg`Create a kickoff task`;
const EMAIL_ACCOUNT_OWNER_STEP_TITLE = msg`Email the account owner`;

export const GETTING_STARTED_HANDOVER_WORKFLOW: GettingStartedWorkflow = {
  triggerTitle: msg`A deal is won`,
  stepTitles: {
    [CREATE_KICKOFF_TASK_STEP_UNIVERSAL_IDENTIFIER]:
      CREATE_KICKOFF_TASK_STEP_TITLE,
    [EMAIL_ACCOUNT_OWNER_STEP_UNIVERSAL_IDENTIFIER]:
      EMAIL_ACCOUNT_OWNER_STEP_TITLE,
  },
  manifest: {
    universalIdentifier: '4cdbbe38-e004-4485-a7f0-a19a8de5f151',
    name: 'Hand over won deals',
    version: {
      trigger: {
        universalIdentifier: '484efebd-6e9a-42dc-ace1-655e5d0e1396',
        type: 'DATABASE_EVENT',
        nextStepIds: [FIND_ACCOUNT_STEP_UNIVERSAL_IDENTIFIER],
        settings: {
          objectUniversalIdentifier:
            STANDARD_OBJECTS.opportunity.universalIdentifier,
          action: 'updated',
          fieldUniversalIdentifiers: [
            STANDARD_OBJECTS.opportunity.fields.stage.universalIdentifier,
          ],
          filter: {
            stepFilterGroups: [
              {
                id: STAGE_FILTER_GROUP_ID,
                logicalOperator: StepLogicalOperator.AND,
              },
            ],
            stepFilters: [
              {
                id: '3f1ecce3-2db2-4dfc-9246-825a0e64577d',
                type: 'SELECT',
                stepOutputKey: '{{trigger.properties.after.stage}}',
                operand: ViewFilterOperand.IS,
                value: '["CUSTOMER"]',
                stepFilterGroupId: STAGE_FILTER_GROUP_ID,
                fieldMetadataUniversalIdentifier:
                  STANDARD_OBJECTS.opportunity.fields.stage.universalIdentifier,
              },
            ],
          },
        },
      },
      steps: [
        {
          universalIdentifier: FIND_ACCOUNT_STEP_UNIVERSAL_IDENTIFIER,
          name: 'Find account',
          type: 'FIND_RECORDS',
          nextStepIds: [FIND_ACCOUNT_OWNER_STEP_UNIVERSAL_IDENTIFIER],
          input: {
            objectUniversalIdentifier:
              STANDARD_OBJECTS.company.universalIdentifier,
            limit: 1,
            filter: {
              recordFilters: [
                {
                  id: 'b5aa322d-0a22-4c05-924a-46ae957ff926',
                  fieldMetadataUniversalIdentifier:
                    STANDARD_OBJECTS.company.fields.id.universalIdentifier,
                  operand: ViewFilterOperand.IS,
                  value: '["{{trigger.properties.after.companyId}}"]',
                },
              ],
            },
          },
        },
        {
          universalIdentifier: FIND_ACCOUNT_OWNER_STEP_UNIVERSAL_IDENTIFIER,
          name: 'Find account owner',
          type: 'FIND_RECORDS',
          nextStepIds: [CREATE_KICKOFF_TASK_STEP_UNIVERSAL_IDENTIFIER],
          input: {
            objectUniversalIdentifier:
              STANDARD_OBJECTS.workspaceMember.universalIdentifier,
            limit: 1,
            filter: {
              recordFilters: [
                {
                  id: 'ebe9c24c-79c6-410e-aeba-a1c142fb08f9',
                  fieldMetadataUniversalIdentifier:
                    STANDARD_OBJECTS.workspaceMember.fields.id
                      .universalIdentifier,
                  operand: ViewFilterOperand.IS,
                  value: `["{{${FIND_ACCOUNT_STEP_UNIVERSAL_IDENTIFIER}.first.accountOwnerId}}"]`,
                },
              ],
            },
          },
        },
        {
          universalIdentifier: CREATE_KICKOFF_TASK_STEP_UNIVERSAL_IDENTIFIER,
          name: i18nLabel(CREATE_KICKOFF_TASK_STEP_TITLE),
          type: 'CREATE_RECORD',
          nextStepIds: [EMAIL_ACCOUNT_OWNER_STEP_UNIVERSAL_IDENTIFIER],
          input: {
            objectUniversalIdentifier:
              STANDARD_OBJECTS.task.universalIdentifier,
            objectRecord: {
              title: 'Kick off {{trigger.properties.after.name}}',
              status: 'TODO',
              assigneeId: `{{${FIND_ACCOUNT_OWNER_STEP_UNIVERSAL_IDENTIFIER}.first.id}}`,
            },
          },
        },
        {
          universalIdentifier: EMAIL_ACCOUNT_OWNER_STEP_UNIVERSAL_IDENTIFIER,
          name: i18nLabel(EMAIL_ACCOUNT_OWNER_STEP_TITLE),
          type: 'SEND_EMAIL',
          nextStepIds: [],
          input: {
            connectedAccountId: '',
            recipients: {
              to: `{{${FIND_ACCOUNT_OWNER_STEP_UNIVERSAL_IDENTIFIER}.first.userEmail}}`,
            },
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
      ],
    },
  },
};
