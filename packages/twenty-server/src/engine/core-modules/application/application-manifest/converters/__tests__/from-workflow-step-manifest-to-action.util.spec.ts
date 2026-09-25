import { FieldMetadataType } from 'twenty-shared/types';
import { workflowStepManifestSchema } from 'twenty-shared/application';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { fromWorkflowStepManifestToAction } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-step-manifest-to-action.util';

const STEP_ID = '11111111-1111-4111-8111-111111111111';
const REFERENCE_ID = '22222222-2222-4222-8222-222222222222';
const FIELD_ID = '33333333-3333-4333-8333-333333333333';
const LOCAL_ID = '44444444-4444-4444-8444-444444444444';
const references = {
  logicFunctionIdByUniversalIdentifier: new Map([[REFERENCE_ID, LOCAL_ID]]),
  codeFunctionIdByUniversalIdentifier: new Map([[REFERENCE_ID, LOCAL_ID]]),
  agentIdByUniversalIdentifier: new Map([[REFERENCE_ID, LOCAL_ID]]),
  objectByUniversalIdentifier: new Map([
    [REFERENCE_ID, { nameSingular: 'company' }],
  ]),
  fieldByUniversalIdentifier: new Map([
    [
      FIELD_ID,
      {
        id: LOCAL_ID,
        name: 'owner',
        objectUniversalIdentifier: REFERENCE_ID,
        type: FieldMetadataType.TEXT,
        settings: null,
        relationTargetObjectMetadataUniversalIdentifier: null,
      },
    ],
  ]),
};
const record = {
  objectUniversalIdentifier: REFERENCE_ID,
  objectRecord: { name: 'Company' },
};
const email = {
  connectedAccountId: '{{trigger.accountId}}',
  recipients: { to: 'test@example.com' },
};
const filters = { stepFilterGroups: [], stepFilters: [] };
const inputs = {
  CODE: { value: 'Hello' },
  LOGIC_FUNCTION: { value: 'Hello' },
  CREATE_RECORD: record,
  UPDATE_RECORD: {
    ...record,
    objectRecordId: '{{trigger.recordId}}',
    fieldsToUpdate: ['name'],
  },
  UPSERT_RECORD: record,
  DELETE_RECORD: {
    objectUniversalIdentifier: REFERENCE_ID,
    objectRecordId: '{{trigger.recordId}}',
  },
  FIND_RECORDS: {
    objectUniversalIdentifier: REFERENCE_ID,
    filter: {
      recordFilters: [
        {
          fieldMetadataUniversalIdentifier: FIELD_ID,
          operand: 'Is',
          value: 'x',
        },
      ],
    },
    orderBy: {
      recordSorts: [
        { fieldMetadataUniversalIdentifier: FIELD_ID, direction: 'ASC' },
      ],
    },
  },
  PICK_RECORD: {
    objectUniversalIdentifier: REFERENCE_ID,
    recordIds: ['{{trigger.recordId}}'],
    strategy: 'LOAD_BALANCED',
    loadBalance: {
      objectUniversalIdentifier: REFERENCE_ID,
      fieldUniversalIdentifier: FIELD_ID,
    },
  },
  SEND_EMAIL: email,
  DRAFT_EMAIL: email,
  CREATE_CALENDAR_EVENT: {
    connectedAccountId: '{{trigger.accountId}}',
    title: 'Meeting',
    startsAt: '2026-10-01T10:00:00Z',
    endsAt: '2026-10-01T11:00:00Z',
    isFullDay: false,
    sendInvitations: false,
    addConferencing: false,
  },
  FORM: [
    {
      id: FIELD_ID,
      name: 'company',
      label: 'Company',
      type: 'RECORD',
      settings: { objectUniversalIdentifier: REFERENCE_ID },
    },
  ],
  HTTP_REQUEST: {
    method: 'POST',
    url: 'https://example.com',
    body: '{{trigger.body}}',
  },
  AI_AGENT: {
    agentUniversalIdentifier: REFERENCE_ID,
    prompt: 'Summarize {{trigger.text}}',
  },
  CLASSIFY: { state: '{{trigger.text}}', questions: [] },
  FILTER: filters,
  IF_ELSE: {
    ...filters,
    branches: [{ id: 'otherwise', nextStepIds: [FIELD_ID] }],
  },
  ITERATOR: { items: '{{trigger.items}}', initialLoopStepIds: [FIELD_ID] },
  DELAY: { delayType: 'DURATION', duration: { seconds: 1 } },
  EMPTY: {},
} satisfies Record<WorkflowActionType, unknown>;

const stepFor = (type: WorkflowActionType) =>
  workflowStepManifestSchema.parse({
    universalIdentifier: STEP_ID,
    name: type,
    type,
    input: inputs[type],
    nextStepIds: [],
    ...(['CODE', 'LOGIC_FUNCTION'].includes(type)
      ? { logicFunctionUniversalIdentifier: REFERENCE_ID }
      : {}),
  });

const convert = (type: WorkflowActionType) =>
  fromWorkflowStepManifestToAction({
    step: stepFor(type),
    index: 0,
    references,
  });

describe('application workflow actions', () => {
  it.each(Object.values(WorkflowActionType))(
    'converts %s to its runtime action',
    (type) => {
      expect(convert(type)).toMatchObject({ id: STEP_ID, type, valid: true });
    },
  );

  it('resolves functions, agents, objects and filter fields', () => {
    expect(convert(WorkflowActionType.CODE).settings.input).toEqual({
      logicFunctionId: LOCAL_ID,
      logicFunctionInput: inputs.CODE,
    });
    expect(convert(WorkflowActionType.AI_AGENT).settings.input).toEqual({
      agentId: LOCAL_ID,
      prompt: inputs.AI_AGENT.prompt,
    });
    expect(convert(WorkflowActionType.CREATE_RECORD).settings.input).toEqual({
      objectName: 'company',
      objectRecord: { name: 'Company' },
    });
    expect(
      convert(WorkflowActionType.FIND_RECORDS).settings.input,
    ).toMatchObject({
      objectName: 'company',
      filter: {
        recordFilters: [
          { fieldMetadataId: LOCAL_ID, operand: 'Is', value: 'x' },
        ],
      },
      orderBy: {
        recordSorts: [{ fieldMetadataId: LOCAL_ID, direction: 'ASC' }],
        gqlOperationOrderBy: [{ owner: 'AscNullsLast' }],
      },
    });
    expect(
      convert(WorkflowActionType.PICK_RECORD).settings.input,
    ).toMatchObject({
      loadBalance: { objectNameSingular: 'company', fieldName: 'owner' },
    });
    expect(convert(WorkflowActionType.FORM).settings.input).toMatchObject([
      { settings: { objectName: 'company' } },
    ]);
  });

  it('rejects unavailable metadata and fields from another object', () => {
    expect(() =>
      fromWorkflowStepManifestToAction({
        step: stepFor(WorkflowActionType.AI_AGENT),
        index: 0,
        references: { ...references, agentIdByUniversalIdentifier: new Map() },
      }),
    ).toThrow('missing application agent');
    expect(() =>
      fromWorkflowStepManifestToAction({
        step: stepFor(WorkflowActionType.FIND_RECORDS),
        index: 0,
        references: {
          ...references,
          fieldByUniversalIdentifier: new Map([
            [
              FIELD_ID,
              {
                id: LOCAL_ID,
                name: 'owner',
                objectUniversalIdentifier: LOCAL_ID,
                type: FieldMetadataType.TEXT,
                settings: null,
                relationTargetObjectMetadataUniversalIdentifier: null,
              },
            ],
          ]),
        },
      }),
    ).toThrow('does not belong');
  });

  it('preserves branches, loop entries, outputs and error handling', () => {
    expect(convert(WorkflowActionType.IF_ELSE).settings.input).toEqual(
      inputs.IF_ELSE,
    );
    expect(convert(WorkflowActionType.ITERATOR).settings.input).toEqual(
      inputs.ITERATOR,
    );
    const step = {
      ...stepFor(WorkflowActionType.HTTP_REQUEST),
      outputSchema: { response: { type: 'string' } },
      expectedOutputSchema: { ok: true },
      errorHandlingOptions: {
        retryOnFailure: { value: 2 },
        continueOnFailure: { value: true },
      },
    };
    const action = fromWorkflowStepManifestToAction({
      step,
      index: 0,
      references,
    });
    expect(action.settings).toMatchObject({
      outputSchema: step.outputSchema,
      expectedOutputSchema: step.expectedOutputSchema,
      errorHandlingOptions: step.errorHandlingOptions,
    });
    expect(action.settings.outputSchema).not.toBe(step.outputSchema);
  });
});
