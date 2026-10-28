import {
  ConnectedAccountProvider,
  FieldMetadataType,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  workflowStepManifestSchema,
  type WorkflowStepManifest,
} from 'twenty-shared/application';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { fromWorkflowStepManifestToActionOrThrow } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-step-manifest-to-action-or-throw.util';
import { type WorkflowManifestConnectedAccountReference } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';

const STEP_ID = '11111111-1111-4111-8111-111111111111';
const REFERENCE_ID = '22222222-2222-4222-8222-222222222222';
const FIELD_ID = '33333333-3333-4333-8333-333333333333';
const LOCAL_ID = '44444444-4444-4444-8444-444444444444';
const RECORD_FILTER_ID = '55555555-5555-4555-8555-555555555555';
const SELECT_FIELD_ID = '66666666-6666-4666-8666-666666666666';
const references = {
  logicFunctionIdByUniversalIdentifier: new Map([[REFERENCE_ID, LOCAL_ID]]),
  agentIdByUniversalIdentifier: new Map([[REFERENCE_ID, LOCAL_ID]]),
  objectByUniversalIdentifier: new Map([
    [REFERENCE_ID, { nameSingular: 'company' }],
  ]),
  fieldByUniversalIdentifier: new Map([
    [
      'name-field',
      {
        id: 'name-id',
        name: 'name',
        objectUniversalIdentifier: REFERENCE_ID,
        type: FieldMetadataType.TEXT,
        settings: null,
        relationTargetObjectMetadataUniversalIdentifier: null,
      },
    ],
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
    [
      SELECT_FIELD_ID,
      {
        id: 'stage-id',
        name: 'stage',
        objectUniversalIdentifier: REFERENCE_ID,
        type: FieldMetadataType.SELECT,
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
          id: RECORD_FILTER_ID,
          fieldMetadataUniversalIdentifier: FIELD_ID,
          operand: ViewFilterOperand.IS,
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
    {
      id: SELECT_FIELD_ID,
      name: 'stage',
      label: 'Stage',
      type: 'SELECT',
      settings: { selectedFieldUniversalIdentifier: SELECT_FIELD_ID },
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
  WAIT_FOR_EVENT: {
    eventName: 'company.updated',
    recordId: '{{trigger.recordId}}',
    timeout: { days: 1 },
  },
  EMPTY: {},
} satisfies Record<WorkflowStepManifest['type'], unknown>;

const stepFor = (type: WorkflowStepManifest['type']) =>
  workflowStepManifestSchema.parse({
    universalIdentifier: STEP_ID,
    name: type,
    type,
    input: inputs[type],
    nextStepIds: [],
    ...(type === 'LOGIC_FUNCTION'
      ? { logicFunctionUniversalIdentifier: REFERENCE_ID }
      : {}),
  });

const convert = (type: WorkflowStepManifest['type']) =>
  fromWorkflowStepManifestToActionOrThrow({
    step: stepFor(type),
    index: 0,
    references,
  });

describe('application workflow actions', () => {
  it('derives a nested function output schema from an expected result', () => {
    const step = stepFor(WorkflowActionType.LOGIC_FUNCTION);
    step.expectedOutputSchema = { company: { name: 'Example' }, count: 2 };
    const result = fromWorkflowStepManifestToActionOrThrow({
      step,
      index: 0,
      references,
    });
    expect(result.settings.outputSchema).toMatchObject({
      company: { isLeaf: false, value: { name: { type: 'string' } } },
      count: { isLeaf: true, type: 'number' },
    });
  });

  it('uses the declared function output schema without running the function', () => {
    const outputSchema = {
      greeting: {
        isLeaf: true as const,
        type: 'string' as const,
        label: 'Greeting',
        value: null,
      },
    };
    const result = fromWorkflowStepManifestToActionOrThrow({
      step: stepFor(WorkflowActionType.LOGIC_FUNCTION),
      index: 0,
      references: {
        ...references,
        logicFunctionOutputSchemaByUniversalIdentifier: new Map([
          [REFERENCE_ID, outputSchema],
        ]),
      },
    });
    expect(result.settings.outputSchema).toEqual(outputSchema);
    expect(result.settings.outputSchema).not.toBe(outputSchema);
  });

  it.each(
    Object.values(WorkflowActionType).filter(
      (type) =>
        type !== WorkflowActionType.CODE &&
        type !== WorkflowActionType.SEND_CHAT_MESSAGE,
    ),
  )('converts %s to its runtime action', (type) => {
    expect(convert(type)).toMatchObject({ id: STEP_ID, type, valid: true });
  });

  it('resolves functions, agents, objects and filter fields', () => {
    expect(convert(WorkflowActionType.LOGIC_FUNCTION).settings.input).toEqual({
      logicFunctionId: LOCAL_ID,
      logicFunctionInput: inputs.LOGIC_FUNCTION,
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
          {
            id: RECORD_FILTER_ID,
            fieldMetadataId: LOCAL_ID,
            operand: ViewFilterOperand.IS,
            value: 'x',
          },
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
    expect(convert(WorkflowActionType.FORM).settings.input).toEqual([
      { ...inputs.FORM[0], settings: { objectName: 'company' } },
      {
        ...inputs.FORM[1],
        settings: { selectType: 'EXISTING_FIELD', selectedFieldId: 'stage-id' },
      },
    ]);
  });

  it('rejects a select form field whose source field is unavailable or of another type', () => {
    const formStepWith = (formField: Record<string, unknown>) =>
      workflowStepManifestSchema.parse({
        universalIdentifier: STEP_ID,
        name: 'Form',
        type: WorkflowActionType.FORM,
        input: [{ id: 'stage', name: 'stage', label: 'Stage', ...formField }],
        nextStepIds: [],
      });

    expect(() =>
      fromWorkflowStepManifestToActionOrThrow({
        step: formStepWith({
          type: 'SELECT',
          settings: { selectedFieldUniversalIdentifier: RECORD_FILTER_ID },
        }),
        index: 0,
        references,
      }),
    ).toThrow('missing field');
    expect(() =>
      fromWorkflowStepManifestToActionOrThrow({
        step: formStepWith({
          type: 'MULTI_SELECT',
          settings: { selectedFieldUniversalIdentifier: SELECT_FIELD_ID },
        }),
        index: 0,
        references,
      }),
    ).toThrow('must reference a MULTI_SELECT field');
  });

  it('accepts record filters declared without an id or a value', () => {
    const step = workflowStepManifestSchema.parse({
      universalIdentifier: STEP_ID,
      name: 'Find records',
      type: WorkflowActionType.FIND_RECORDS,
      input: {
        objectUniversalIdentifier: REFERENCE_ID,
        filter: {
          recordFilters: [
            {
              fieldMetadataUniversalIdentifier: FIELD_ID,
              operand: ViewFilterOperand.IS,
              value: 'x',
            },
            {
              fieldMetadataUniversalIdentifier: FIELD_ID,
              operand: ViewFilterOperand.IS_EMPTY,
            },
          ],
        },
      },
      nextStepIds: [],
    });

    expect(
      fromWorkflowStepManifestToActionOrThrow({ step, index: 0, references })
        .settings.input,
    ).toMatchObject({
      filter: {
        recordFilters: [
          {
            fieldMetadataId: LOCAL_ID,
            operand: ViewFilterOperand.IS,
            value: 'x',
          },
          {
            fieldMetadataId: LOCAL_ID,
            operand: ViewFilterOperand.IS_EMPTY,
          },
        ],
      },
    });
  });

  it('rejects unavailable metadata and fields from another object', () => {
    expect(() =>
      fromWorkflowStepManifestToActionOrThrow({
        step: stepFor(WorkflowActionType.AI_AGENT),
        index: 0,
        references: { ...references, agentIdByUniversalIdentifier: new Map() },
      }),
    ).toThrow('missing application agent');
    expect(() =>
      fromWorkflowStepManifestToActionOrThrow({
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

  describe('connected accounts', () => {
    const GOOGLE_CALENDAR_EVENTS_SCOPE =
      'https://www.googleapis.com/auth/calendar.events';
    const connectedAccount = (
      overrides: Partial<WorkflowManifestConnectedAccountReference>,
    ): WorkflowManifestConnectedAccountReference => ({
      id: 'account-id',
      handle: 'sales@example.com',
      provider: ConnectedAccountProvider.GOOGLE,
      connectionParameters: null,
      archivedAt: null,
      scopes: [GOOGLE_CALENDAR_EVENTS_SCOPE],
      scope: 'WORKSPACE',
      calendarChannels: [{ isSyncEnabled: true }],
      ...overrides,
    });
    const connectedAccounts = [
      connectedAccount({ id: 'archived-id', archivedAt: new Date() }),
      connectedAccount({
        id: 'imap-id',
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: {
          IMAP: { host: 'imap.example.com', port: 993 },
        } as WorkflowManifestConnectedAccountReference['connectionParameters'],
        scopes: null,
        calendarChannels: [],
      }),
      connectedAccount({ id: 'google-id', handle: 'Sales@Example.com' }),
    ];
    const convertWithHandle = ({
      type,
      handle,
      accounts = connectedAccounts,
    }: {
      type: 'SEND_EMAIL' | 'DRAFT_EMAIL' | 'CREATE_CALENDAR_EVENT';
      handle: string;
      accounts?: WorkflowManifestConnectedAccountReference[];
    }) => {
      const { connectedAccountId: _connectedAccountId, ...input } =
        inputs[type];

      return fromWorkflowStepManifestToActionOrThrow({
        step: workflowStepManifestSchema.parse({
          universalIdentifier: STEP_ID,
          name: 'Reach out',
          type,
          input: { ...input, connectedAccountHandle: handle },
          nextStepIds: [],
        }),
        index: 0,
        references: { ...references, connectedAccounts: accounts },
      }).settings.input;
    };

    it.each([
      { type: 'SEND_EMAIL' as const, connectedAccountId: 'google-id' },
      { type: 'DRAFT_EMAIL' as const, connectedAccountId: 'imap-id' },
      {
        type: 'CREATE_CALENDAR_EVENT' as const,
        connectedAccountId: 'google-id',
      },
    ])(
      'resolves a $type handle to the oldest active account able to run it',
      ({ type, connectedAccountId }) => {
        const input = convertWithHandle({ type, handle: 'sales@example.com' });

        expect(input).toMatchObject({ connectedAccountId });
        expect(input).not.toHaveProperty('connectedAccountHandle');
      },
    );

    it.each([
      {
        case: 'calendar sync is disabled',
        account: connectedAccount({
          calendarChannels: [{ isSyncEnabled: false }],
        }),
      },
      {
        case: 'the calendar scope is missing',
        account: connectedAccount({ scopes: [] }),
      },
    ])(
      'does not create calendar events with an account whose $case',
      ({ account }) => {
        expect(() =>
          convertWithHandle({
            type: 'CREATE_CALENDAR_EVENT',
            handle: 'sales@example.com',
            accounts: [account],
          }),
        ).toThrow('can create calendar events');
      },
    );

    it.each([
      '{{trigger.properties.after.assigneeId}}',
      '20202020-0687-4c41-b707-ed1bfca972a7',
    ])('keeps the account value %s as declared', (connectedAccountId) => {
      expect(
        fromWorkflowStepManifestToActionOrThrow({
          step: workflowStepManifestSchema.parse({
            universalIdentifier: STEP_ID,
            name: 'Reach out',
            type: 'SEND_EMAIL',
            input: { ...email, connectedAccountId },
            nextStepIds: [],
          }),
          index: 0,
          references: { ...references, connectedAccounts },
        }).settings.input,
      ).toMatchObject({ connectedAccountId });
    });

    it('fails on a handle no account of the workspace can send from', () => {
      expect(() =>
        convertWithHandle({
          type: 'SEND_EMAIL',
          handle: 'unknown@example.com',
        }),
      ).toThrow(
        'Workflow step Reach out: no connected account unknown@example.com shared with this workspace can send email',
      );
    });

    it('does not resolve a handle to an account private to a member', () => {
      expect(() =>
        convertWithHandle({
          type: 'SEND_EMAIL',
          handle: 'sales@example.com',
          accounts: [connectedAccount({ scope: 'USER' })],
        }),
      ).toThrow('no connected account sales@example.com shared with');
    });

    it('resolves a handle to a shared account over an older private one', () => {
      expect(
        convertWithHandle({
          type: 'SEND_EMAIL',
          handle: 'sales@example.com',
          accounts: [
            connectedAccount({ id: 'private-id', scope: 'USER' }),
            connectedAccount({ id: 'shared-id' }),
          ],
        }),
      ).toMatchObject({ connectedAccountId: 'shared-id' });
    });
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
    const action = fromWorkflowStepManifestToActionOrThrow({
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
