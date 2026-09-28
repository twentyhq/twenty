import { defineWorkflow } from 'twenty-sdk/define';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { StepLogicalOperator, ViewFilterOperand } from 'twenty-shared/types';
import { DEMO_AGENT_UNIVERSAL_IDENTIFIER } from '../agents/demo.agent';
import { PREPARE_DEMO_UNIVERSAL_IDENTIFIER } from '../logic-functions/prepare-demo.function';
import { GREET_UNIVERSAL_IDENTIFIER } from '../logic-functions/greet.function';

const STEP_IDS = {
  FORM: 'fd50c2cd-f8c3-51dd-a1fd-ab7fe5defec7',
  CODE: '78448ce3-1c80-546e-8e72-6af850f57bf5',
  LOGIC_FUNCTION: 'ebb40622-ccde-5f49-9f87-8ccd7221de18',
  CREATE_RECORD: '8689d5e3-2b2e-5e53-9901-c552ff3e2d38',
  UPDATE_RECORD: '31e5af43-d809-5fb3-b983-d2304aa57e52',
  UPSERT_RECORD: 'e85b6d47-5ab1-5a56-ae7d-80b9c04f1235',
  FIND_RECORDS: 'a3f05459-5849-5902-8d68-2307f86f48aa',
  PICK_RECORD: '2a0ec5a2-d8a1-5840-971b-247b1261ce77',
  FILTER: '9c7c8e56-1096-5153-a831-691a26b2aef4',
  IF_ELSE: '1bbe78e8-cae1-5737-91fb-2e67c09f1ab6',
  DRAFT_EMAIL: '5a1490c9-99bb-58df-8547-3d0eb3f2575f',
  SEND_EMAIL: 'eacf6b09-5feb-5a49-9d07-1f14d8a9a606',
  CREATE_CALENDAR_EVENT: '4aa442e8-aeff-5e7b-87bd-4e8a7c570425',
  HTTP_REQUEST: 'efb842bb-cf9b-5363-9d58-cd66fbb5e683',
  AI_AGENT: '06b89084-9c5d-51bd-9666-a4d967a6027e',
  CLASSIFY: '80263358-e6c7-55ca-8749-9e4829f81444',
  ITERATOR: '136ca3b7-c3cb-5245-afa7-6f6bb33e24ae',
  DELAY: 'aee90555-a305-5cd1-afd9-9b6c9dfe7e10',
  DELETE_RECORD: '7e8afe58-8494-50ea-b420-2e51548df1aa',
  EMPTY: '78c99847-bc7c-5d24-a646-3eb195854a82',
};

const fromStep = (stepId: string, field: string) => `{{${stepId}.${field}}}`;

export default defineWorkflow({
  universalIdentifier: '5a6e0868-01ca-5b0a-b21d-1fdc4578596e',
  name: 'All 20 step types — app demo',
  version: {
    universalIdentifier: '7766355f-14ba-5ab0-9986-10d817d0f8bb',
    trigger: {
      universalIdentifier: '4efb38bf-5cc7-5d61-94e4-cc6d35e989f4',
      type: 'MANUAL',
      nextStepIds: [STEP_IDS.FORM],
    },
    steps: [
      {
        universalIdentifier: STEP_IDS.FORM,
        name: 'Collect demo inputs',
        type: 'FORM',
        position: {
          x: 0,
          y: 180,
        },
        input: [
          {
            id: 'd1c8b01c-08cd-5fbe-920a-3d56b432ea56',
            name: 'companyName',
            label: 'Demo company name',
            type: 'TEXT',
            value: 'All steps demo',
          },
          {
            id: '2917cc54-0c66-51f7-a1da-0bd0337629a9',
            name: 'connectedAccountId',
            label: 'Connected account ID (email/calendar branch)',
            type: 'TEXT',
          },
          {
            id: 'f0cc6718-5ba4-50d2-a818-422b3a340a32',
            name: 'recipient',
            label: 'Email recipient',
            type: 'TEXT',
            value: 'demo@example.invalid',
          },
          {
            id: '1e212076-4863-55dd-957f-0373003adf6d',
            name: 'externalActions',
            label: 'Run email/calendar branch? Enter yes or no',
            type: 'TEXT',
            value: 'no',
          },
        ],
        nextStepIds: [STEP_IDS.CODE],
      },
      {
        universalIdentifier: STEP_IDS.CODE,
        name: 'Prepare a unique company name',
        type: 'CODE',
        expectedOutputSchema: {
          companyName: 'Demo company',
          summaryPrompt: 'Describe the demo company',
        },
        position: {
          x: 0,
          y: 360,
        },
        input: {
          companyName: fromStep(STEP_IDS.FORM, 'companyName'),
        },
        nextStepIds: [STEP_IDS.LOGIC_FUNCTION],
        logicFunctionUniversalIdentifier: PREPARE_DEMO_UNIVERSAL_IDENTIFIER,
      },
      {
        universalIdentifier: STEP_IDS.LOGIC_FUNCTION,
        name: 'Call an exposed app function',
        type: 'LOGIC_FUNCTION',
        position: {
          x: 0,
          y: 540,
        },
        input: {
          greeting: fromStep(STEP_IDS.CODE, 'companyName'),
        },
        nextStepIds: [STEP_IDS.CREATE_RECORD],
        logicFunctionUniversalIdentifier: GREET_UNIVERSAL_IDENTIFIER,
      },
      {
        universalIdentifier: STEP_IDS.CREATE_RECORD,
        name: 'Create the demo company',
        type: 'CREATE_RECORD',
        position: {
          x: 0,
          y: 720,
        },
        input: {
          objectUniversalIdentifier:
            STANDARD_OBJECTS.company.universalIdentifier,
          objectRecord: {
            name: fromStep(STEP_IDS.CODE, 'companyName'),
          },
        },
        nextStepIds: [STEP_IDS.UPDATE_RECORD],
      },
      {
        universalIdentifier: STEP_IDS.UPDATE_RECORD,
        name: 'Update the demo company name',
        type: 'UPDATE_RECORD',
        position: {
          x: 0,
          y: 900,
        },
        input: {
          objectUniversalIdentifier:
            STANDARD_OBJECTS.company.universalIdentifier,
          objectRecordId: fromStep(STEP_IDS.CREATE_RECORD, 'id'),
          objectRecord: {
            name: `${fromStep(STEP_IDS.CODE, 'companyName')} — updated`,
          },
          fieldsToUpdate: ['name'],
        },
        nextStepIds: [STEP_IDS.UPSERT_RECORD],
      },
      {
        universalIdentifier: STEP_IDS.UPSERT_RECORD,
        name: 'Upsert the same demo company',
        type: 'UPSERT_RECORD',
        position: {
          x: 0,
          y: 1080,
        },
        input: {
          objectUniversalIdentifier:
            STANDARD_OBJECTS.company.universalIdentifier,
          objectRecord: {
            id: fromStep(STEP_IDS.CREATE_RECORD, 'id'),
            name: `${fromStep(STEP_IDS.CODE, 'companyName')} — upserted`,
          },
        },
        nextStepIds: [STEP_IDS.FIND_RECORDS],
      },
      {
        universalIdentifier: STEP_IDS.FIND_RECORDS,
        name: 'Find the demo company',
        type: 'FIND_RECORDS',
        position: {
          x: 0,
          y: 1260,
        },
        input: {
          objectUniversalIdentifier:
            STANDARD_OBJECTS.company.universalIdentifier,
          limit: 1,
          filter: {
            recordFilters: [
              {
                id: 'f7b87790-de66-5a7a-b33c-dab5d8532123',
                fieldMetadataUniversalIdentifier:
                  STANDARD_OBJECTS.company.fields.id.universalIdentifier,
                type: 'UUID',
                operand: ViewFilterOperand.IS,
                value: fromStep(STEP_IDS.CREATE_RECORD, 'id'),
              },
            ],
          },
          orderBy: {
            recordSorts: [
              {
                id: 'a3d23d39-e85e-5bac-ad90-8f702ef95e8e',
                fieldMetadataUniversalIdentifier:
                  STANDARD_OBJECTS.company.fields.name.universalIdentifier,
                direction: 'ASC',
              },
            ],
          },
        },
        nextStepIds: [STEP_IDS.PICK_RECORD],
      },
      {
        universalIdentifier: STEP_IDS.PICK_RECORD,
        name: 'Pick the demo record',
        type: 'PICK_RECORD',
        position: {
          x: 0,
          y: 1440,
        },
        input: {
          objectUniversalIdentifier:
            STANDARD_OBJECTS.company.universalIdentifier,
          strategy: 'RANDOM',
          recordIds: [fromStep(STEP_IDS.CREATE_RECORD, 'id')],
        },
        nextStepIds: [STEP_IDS.FILTER],
      },
      {
        universalIdentifier: STEP_IDS.FILTER,
        name: 'Require a company name',
        type: 'FILTER',
        position: {
          x: 0,
          y: 1620,
        },
        input: {
          stepFilterGroups: [
            {
              id: '376fb9f2-fe32-56e4-bcb5-8748b8ca15e8',
              logicalOperator: StepLogicalOperator.AND,
            },
          ],
          stepFilters: [
            {
              id: 'fb14d492-d2cf-5cb7-ade7-d5e4965a1043',
              type: 'TEXT',
              stepOutputKey: fromStep(STEP_IDS.FORM, 'companyName'),
              operand: ViewFilterOperand.IS_NOT_EMPTY,
              value: '',
              stepFilterGroupId: '376fb9f2-fe32-56e4-bcb5-8748b8ca15e8',
            },
          ],
        },
        nextStepIds: [STEP_IDS.IF_ELSE],
      },
      {
        universalIdentifier: STEP_IDS.IF_ELSE,
        name: 'Choose external actions',
        type: 'IF_ELSE',
        position: {
          x: 0,
          y: 1800,
        },
        input: {
          stepFilterGroups: [
            {
              id: '6a655ba4-02f4-5e14-8de0-603153568793',
              logicalOperator: StepLogicalOperator.AND,
            },
          ],
          stepFilters: [
            {
              id: 'cce1b1a9-978d-5c0f-b548-1a18aa40ce1c',
              type: 'TEXT',
              stepOutputKey: fromStep(STEP_IDS.FORM, 'externalActions'),
              operand: ViewFilterOperand.IS,
              value: 'yes',
              stepFilterGroupId: '6a655ba4-02f4-5e14-8de0-603153568793',
            },
          ],
          branches: [
            {
              id: '4afd5f46-06ed-596a-b338-2fef7ec23b78',
              filterGroupId: '6a655ba4-02f4-5e14-8de0-603153568793',
              nextStepIds: [STEP_IDS.DRAFT_EMAIL],
            },
            {
              id: '22fdfec0-0c7f-5acb-9781-83b0f82f711a',
              nextStepIds: [STEP_IDS.HTTP_REQUEST],
            },
          ],
        },
        nextStepIds: [],
      },
      {
        universalIdentifier: STEP_IDS.DRAFT_EMAIL,
        name: 'Create an email draft',
        type: 'DRAFT_EMAIL',
        position: {
          x: -340,
          y: 1980,
        },
        input: {
          connectedAccountId: fromStep(STEP_IDS.FORM, 'connectedAccountId'),
          recipients: {
            to: fromStep(STEP_IDS.FORM, 'recipient'),
          },
          subject: 'Workflow step gallery — draft',
          body: 'Created by the all-step-types demo.',
        },
        nextStepIds: [STEP_IDS.SEND_EMAIL],
      },
      {
        universalIdentifier: STEP_IDS.SEND_EMAIL,
        name: 'Send a separate email',
        type: 'SEND_EMAIL',
        position: {
          x: -340,
          y: 2160,
        },
        input: {
          connectedAccountId: fromStep(STEP_IDS.FORM, 'connectedAccountId'),
          recipients: {
            to: fromStep(STEP_IDS.FORM, 'recipient'),
          },
          subject: 'Workflow step gallery — send',
          body: 'This is the separate Send email action in the demo.',
        },
        nextStepIds: [STEP_IDS.CREATE_CALENDAR_EVENT],
      },
      {
        universalIdentifier: STEP_IDS.CREATE_CALENDAR_EVENT,
        name: 'Create a calendar event',
        type: 'CREATE_CALENDAR_EVENT',
        position: {
          x: -340,
          y: 2340,
        },
        input: {
          connectedAccountId: fromStep(STEP_IDS.FORM, 'connectedAccountId'),
          title: 'Workflow step gallery demo',
          startsAt: '2030-01-15T10:00:00Z',
          endsAt: '2030-01-15T10:15:00Z',
          isFullDay: false,
          sendInvitations: false,
          addConferencing: false,
          timeZone: 'UTC',
        },
        nextStepIds: [STEP_IDS.AI_AGENT],
      },
      {
        universalIdentifier: STEP_IDS.HTTP_REQUEST,
        name: 'Fetch example.com',
        type: 'HTTP_REQUEST',
        position: {
          x: 340,
          y: 1980,
        },
        input: {
          method: 'GET',
          url: 'https://example.com',
        },
        nextStepIds: [STEP_IDS.AI_AGENT],
      },
      {
        universalIdentifier: STEP_IDS.AI_AGENT,
        name: 'Ask the app agent',
        type: 'AI_AGENT',
        position: {
          x: 0,
          y: 2580,
        },
        input: {
          agentUniversalIdentifier: DEMO_AGENT_UNIVERSAL_IDENTIFIER,
          prompt: fromStep(STEP_IDS.CODE, 'summaryPrompt'),
        },
        nextStepIds: [STEP_IDS.CLASSIFY],
      },
      {
        universalIdentifier: STEP_IDS.CLASSIFY,
        name: 'Classify the company name',
        type: 'CLASSIFY',
        position: {
          x: 0,
          y: 2760,
        },
        input: {
          state: fromStep(STEP_IDS.CODE, 'companyName'),
          questions: [
            {
              id: 'ced2b633-bb4e-5089-9dbf-ca3f4eec182a',
              name: 'is_demo',
              type: 'boolean',
              instructions:
                'Does this company name describe a demo or test company?',
              criteria: [],
            },
          ],
        },
        nextStepIds: [STEP_IDS.ITERATOR],
      },
      {
        universalIdentifier: STEP_IDS.ITERATOR,
        name: 'Iterate over two items',
        type: 'ITERATOR',
        position: {
          x: 0,
          y: 2940,
        },
        input: {
          items: ['first item', 'second item'],
          initialLoopStepIds: [STEP_IDS.DELAY],
        },
        nextStepIds: [STEP_IDS.DELETE_RECORD],
      },
      {
        universalIdentifier: STEP_IDS.DELAY,
        name: 'Wait inside the loop',
        type: 'DELAY',
        position: {
          x: 340,
          y: 3120,
        },
        input: {
          delayType: 'DURATION',
          duration: {
            seconds: 1,
          },
        },
        nextStepIds: [STEP_IDS.ITERATOR],
      },
      {
        universalIdentifier: STEP_IDS.DELETE_RECORD,
        name: 'Delete the created demo company',
        type: 'DELETE_RECORD',
        position: {
          x: 0,
          y: 3300,
        },
        input: {
          objectUniversalIdentifier:
            STANDARD_OBJECTS.company.universalIdentifier,
          objectRecordId: fromStep(STEP_IDS.CREATE_RECORD, 'id'),
        },
        nextStepIds: [STEP_IDS.EMPTY],
      },
      {
        universalIdentifier: STEP_IDS.EMPTY,
        name: 'Finish',
        type: 'EMPTY',
        position: {
          x: 0,
          y: 3480,
        },
        input: {},
        nextStepIds: [],
      },
    ],
  },
});
