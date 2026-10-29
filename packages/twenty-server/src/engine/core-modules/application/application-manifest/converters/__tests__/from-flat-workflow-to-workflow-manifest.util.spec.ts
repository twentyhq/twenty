import {
  type WorkflowManifest,
  type WorkflowStepManifest,
  type WorkflowTriggerManifest,
} from 'twenty-shared/application';
import {
  ConnectedAccountProvider,
  FieldMetadataType,
  RecordFilterGroupLogicalOperator,
  RelationType,
  StepLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { fromFlatWorkflowToWorkflowManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-workflow-to-workflow-manifest.util';
import { fromWorkflowManifestToUniversalFlatWorkflowOrThrow } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-manifest-to-universal-flat-workflow-or-throw.util';
import { type WorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { type ConnectedAccountForWorkflowStepResolution } from 'src/engine/metadata-modules/connected-account/types/connected-account-for-workflow-step-resolution.type';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';

const APPLICATION_ID = '10000000-0000-4000-8000-000000000000';
const WORKFLOW_ID = '20000000-0000-4000-8000-000000000000';
const TRIGGER_ID = '30000000-0000-4000-8000-000000000000';
const STEP_ID = '40000000-0000-4000-8000-000000000000';
const SECOND_STEP_ID = '41000000-0000-4000-8000-000000000000';
const THIRD_STEP_ID = '42000000-0000-4000-8000-000000000000';
const OBJECT_ID = '50000000-0000-4000-8000-000000000000';
const STATUS_FIELD_ID = '60000000-0000-4000-8000-000000000000';
const COMPANY_FIELD_ID = '61000000-0000-4000-8000-000000000000';
const PRIORITY_FIELD_ID = '62000000-0000-4000-8000-000000000000';
const FUNCTION_ID = '70000000-0000-4000-8000-000000000000';
const AGENT_ID = '80000000-0000-4000-8000-000000000000';
const RECORD_FILTER_ID = '90000000-0000-4000-8000-000000000000';

const SALES_HANDLE = 'sales@example.com';
const WORKSPACE_MEMBER_ID = 'a0000000-0000-4000-8000-000000000000';

const connectedAccount = (
  overrides: Partial<ConnectedAccountForWorkflowStepResolution>,
): ConnectedAccountForWorkflowStepResolution => ({
  id: 'sales-account-id',
  handle: SALES_HANDLE,
  provider: ConnectedAccountProvider.GOOGLE,
  connectionParameters: null,
  archivedAt: null,
  scopes: ['https://www.googleapis.com/auth/calendar.events'],
  scope: 'WORKSPACE',
  calendarChannels: [{ isSyncEnabled: true }],
  ...overrides,
});

const references: WorkflowManifestReferences = {
  connectedAccounts: [connectedAccount({})],
  logicFunctionIdByUniversalIdentifier: new Map([
    [FUNCTION_ID, 'logic-function-id'],
  ]),
  agentIdByUniversalIdentifier: new Map([[AGENT_ID, 'agent-id']]),
  objectByUniversalIdentifier: new Map([
    [OBJECT_ID, { nameSingular: 'ticket' }],
  ]),
  fieldByUniversalIdentifier: new Map([
    [
      STATUS_FIELD_ID,
      {
        id: 'status-field-id',
        name: 'status',
        objectUniversalIdentifier: OBJECT_ID,
        type: FieldMetadataType.TEXT,
        settings: null,
        relationTargetObjectMetadataUniversalIdentifier: null,
      },
    ],
    [
      COMPANY_FIELD_ID,
      {
        id: 'company-field-id',
        name: 'company',
        objectUniversalIdentifier: OBJECT_ID,
        type: FieldMetadataType.RELATION,
        settings: null,
        universalSettings: { relationType: RelationType.MANY_TO_ONE },
        relationTargetObjectMetadataUniversalIdentifier: OBJECT_ID,
      },
    ],
    [
      PRIORITY_FIELD_ID,
      {
        id: 'priority-field-id',
        name: 'priority',
        objectUniversalIdentifier: OBJECT_ID,
        type: FieldMetadataType.SELECT,
        settings: null,
        relationTargetObjectMetadataUniversalIdentifier: null,
      },
    ],
  ]),
};

const MANUAL_TRIGGER: WorkflowTriggerManifest = {
  universalIdentifier: TRIGGER_ID,
  type: 'MANUAL',
  nextStepIds: [STEP_ID],
};

const STEP_FILTERS = {
  stepFilterGroups: [{ id: 'group', logicalOperator: StepLogicalOperator.AND }],
  stepFilters: [
    {
      id: 'filter',
      type: 'TEXT',
      stepOutputKey: '{{trigger.properties.after.status}}',
      operand: ViewFilterOperand.IS,
      value: 'open',
      stepFilterGroupId: 'group',
      fieldMetadataUniversalIdentifier: STATUS_FIELD_ID,
    },
  ],
};

const RECORD = { objectUniversalIdentifier: OBJECT_ID };

const STEP_INPUTS = {
  LOGIC_FUNCTION: { greeting: 'Hello', nested: { count: 2 } },
  CREATE_RECORD: { ...RECORD, objectRecord: { name: 'Ticket' } },
  UPDATE_RECORD: {
    ...RECORD,
    objectRecord: { name: 'Ticket' },
    objectRecordId: '{{trigger.recordId}}',
    fieldsToUpdate: ['name'],
  },
  UPSERT_RECORD: { ...RECORD, objectRecord: { name: 'Ticket' } },
  DELETE_RECORD: { ...RECORD, objectRecordId: '{{trigger.recordId}}' },
  FIND_RECORDS: {
    ...RECORD,
    limit: 10,
    filter: {
      recordFilterGroups: [
        { id: 'root', logicalOperator: RecordFilterGroupLogicalOperator.AND },
      ],
      recordFilters: [
        {
          id: RECORD_FILTER_ID,
          fieldMetadataUniversalIdentifier: STATUS_FIELD_ID,
          operand: ViewFilterOperand.IS,
          value: 'open',
          recordFilterGroupId: 'root',
        },
      ],
    },
    orderBy: {
      recordSorts: [
        {
          fieldMetadataUniversalIdentifier: STATUS_FIELD_ID,
          direction: 'DESC',
        },
      ],
    },
  },
  PICK_RECORD: {
    ...RECORD,
    recordIds: ['{{trigger.recordId}}'],
    strategy: 'LOAD_BALANCED',
    loadBalance: {
      objectUniversalIdentifier: OBJECT_ID,
      fieldUniversalIdentifier: STATUS_FIELD_ID,
    },
  },
  FORM: [
    { id: 'name', name: 'name', label: 'Name', type: 'TEXT' },
    {
      id: 'ticket',
      name: 'ticket',
      label: 'Ticket',
      type: 'RECORD',
      settings: { objectUniversalIdentifier: OBJECT_ID },
    },
    {
      id: 'priority',
      name: 'priority',
      label: 'Priority',
      type: 'SELECT',
      settings: { selectedFieldUniversalIdentifier: PRIORITY_FIELD_ID },
    },
  ],
  HTTP_REQUEST: {
    method: 'POST',
    url: 'https://example.com',
    headers: { 'x-b': '2', 'x-a': '1' },
    body: { name: '{{trigger.name}}' },
  },
  AI_AGENT: {
    agentUniversalIdentifier: AGENT_ID,
    prompt: 'Summarize {{trigger.text}}',
  },
  CLASSIFY: { state: '{{trigger.text}}', questions: [] },
  FILTER: STEP_FILTERS,
  DELAY: { delayType: 'DURATION', duration: { seconds: 1 } },
  WAIT_FOR_EVENT: {
    eventName: 'ticket.updated',
    recordId: '{{trigger.recordId}}',
    timeout: { days: 1 },
  },
  SEND_EMAIL: {
    connectedAccountHandle: SALES_HANDLE,
    recipients: { to: '{{trigger.properties.after.email}}', cc: '', bcc: '' },
    subject: 'Welcome',
    files: [],
  },
  DRAFT_EMAIL: {
    connectedAccountId: '{{trigger.properties.after.assigneeId}}',
    recipients: { to: 'jane@example.com', cc: '', bcc: '' },
    files: [],
  },
  CREATE_CALENDAR_EVENT: {
    connectedAccountHandle: SALES_HANDLE,
    title: 'Kick-off',
    startsAt: '2026-11-02T09:00:00.000Z',
    endsAt: '2026-11-02T09:30:00.000Z',
    isFullDay: false,
    attendees: '',
    sendInvitations: true,
    addConferencing: false,
  },
  EMPTY: {},
};

const buildStep = ({
  type,
  overrides = {},
}: {
  type: keyof typeof STEP_INPUTS;
  overrides?: Partial<WorkflowStepManifest>;
}): WorkflowStepManifest =>
  ({
    universalIdentifier: STEP_ID,
    name: `${type} step`,
    type,
    nextStepIds: [],
    input: STEP_INPUTS[type],
    ...(type === 'LOGIC_FUNCTION'
      ? { logicFunctionUniversalIdentifier: FUNCTION_ID }
      : {}),
    ...overrides,
  }) as WorkflowStepManifest;

const buildWorkflow = ({
  trigger = MANUAL_TRIGGER,
  steps = [buildStep({ type: 'EMPTY' })],
}: {
  trigger?: WorkflowTriggerManifest;
  steps?: WorkflowStepManifest[];
}): WorkflowManifest => ({
  universalIdentifier: WORKFLOW_ID,
  name: 'Triage tickets',
  version: { trigger, steps },
});

const sendEmailWorkflow = (accountReference: Record<string, string>) => {
  const { connectedAccountHandle: _connectedAccountHandle, ...input } =
    STEP_INPUTS.SEND_EMAIL;

  return buildWorkflow({
    steps: [
      buildStep({
        type: 'SEND_EMAIL',
        overrides: {
          input: { ...input, ...accountReference },
        } as Partial<WorkflowStepManifest>,
      }),
    ],
  });
};

const syncWorkflow = (manifest: WorkflowManifest) => {
  const { flatUniversalWorkflowVersion, ...workflow } =
    fromWorkflowManifestToUniversalFlatWorkflowOrThrow({
      manifest,
      applicationUniversalIdentifier: APPLICATION_ID,
      now: '2026-10-26T00:00:00.000Z',
      ...references,
    });

  const flatWorkflow: FlatWorkflow = {
    ...workflow,
    workspaceId: 'workspace-id',
    applicationId: 'application-id',
  };
  // Stored versions come back from jsonb, which drops undefined values and reorders keys.
  const flatWorkflowVersion: FlatWorkflowVersion = JSON.parse(
    JSON.stringify({
      ...flatUniversalWorkflowVersion,
      workspaceId: 'workspace-id',
      applicationId: 'application-id',
    }),
  );

  return { flatWorkflow, flatWorkflowVersion };
};

const reverseKeysDeeply = <TValue>(value: TValue): TValue => {
  if (Array.isArray(value)) {
    return value.map(reverseKeysDeeply) as TValue;
  }

  if (!isDefined(value) || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .reverse()
      .map(([key, entry]) => [key, reverseKeysDeeply(entry)]),
  ) as TValue;
};

const exportWorkflow = ({
  flatWorkflow,
  flatWorkflowVersion,
  exportReferences = references,
}: ReturnType<typeof syncWorkflow> & {
  exportReferences?: WorkflowManifestReferences;
}) =>
  fromFlatWorkflowToWorkflowManifest({
    flatWorkflow,
    flatWorkflowVersion,
    references: exportReferences,
  });

const expectRoundTrip = (manifest: WorkflowManifest) => {
  const synced = syncWorkflow(manifest);

  expect(exportWorkflow(synced)).toEqual({ manifest });
};

const AFTER_STEP: WorkflowStepManifest = {
  universalIdentifier: SECOND_STEP_ID,
  name: 'After',
  type: 'EMPTY',
  nextStepIds: [],
  input: {},
};

const BRANCHING_STEPS: Record<'IF_ELSE' | 'ITERATOR', WorkflowStepManifest[]> =
  {
    IF_ELSE: [
      {
        universalIdentifier: STEP_ID,
        name: 'Choose',
        type: 'IF_ELSE',
        nextStepIds: [],
        input: {
          ...STEP_FILTERS,
          branches: [
            {
              id: 'open',
              nextStepIds: [SECOND_STEP_ID],
              filterGroupId: 'group',
            },
            { id: 'otherwise', nextStepIds: [THIRD_STEP_ID] },
          ],
        },
      },
      AFTER_STEP,
      {
        universalIdentifier: THIRD_STEP_ID,
        name: 'Otherwise',
        type: 'EMPTY',
        nextStepIds: [],
        input: {},
      },
    ],
    ITERATOR: [
      {
        universalIdentifier: STEP_ID,
        name: 'Repeat',
        type: 'ITERATOR',
        nextStepIds: [SECOND_STEP_ID],
        input: { items: ['one', 'two'], initialLoopStepIds: [THIRD_STEP_ID] },
      },
      AFTER_STEP,
      {
        universalIdentifier: THIRD_STEP_ID,
        name: 'Inside',
        type: 'EMPTY',
        nextStepIds: [STEP_ID],
        input: {},
      },
    ],
  };

describe('fromFlatWorkflowToWorkflowManifest', () => {
  describe('round trip through sync', () => {
    it.each(Object.keys(STEP_INPUTS) as (keyof typeof STEP_INPUTS)[])(
      'exports a %s step as it was declared',
      (type) => {
        expectRoundTrip(buildWorkflow({ steps: [buildStep({ type })] }));
      },
    );

    it.each(['IF_ELSE', 'ITERATOR'] as const)('exports %s branches', (type) => {
      expectRoundTrip(buildWorkflow({ steps: BRANCHING_STEPS[type] }));
    });

    it('exports a position, outputs and error handling that differ from the defaults', () => {
      expectRoundTrip(
        buildWorkflow({
          steps: [
            buildStep({
              type: 'HTTP_REQUEST',
              overrides: {
                position: { x: 40, y: 90 },
                outputSchema: { response: { isLeaf: true, type: 'string' } },
                expectedOutputSchema: { ok: true },
                errorHandlingOptions: {
                  retryOnFailure: { value: 2 },
                  continueOnFailure: { value: true },
                },
              },
            }),
          ],
        }),
      );
    });

    describe('connected accounts', () => {
      it('stores the account a handle resolves to and exports its handle back', () => {
        const synced = syncWorkflow(
          sendEmailWorkflow({ connectedAccountId: 'sales-account-id' }),
        );

        expect(
          synced.flatWorkflowVersion.steps?.[0]?.settings.input,
        ).toMatchObject({ connectedAccountId: 'sales-account-id' });
        expect(exportWorkflow(synced)).toEqual({
          manifest: sendEmailWorkflow({ connectedAccountHandle: SALES_HANDLE }),
        });
      });

      it('exports a step on an account private to a member as its id', () => {
        const manifest = sendEmailWorkflow({
          connectedAccountId: 'sales-account-id',
        });

        expect(
          exportWorkflow({
            ...syncWorkflow(manifest),
            exportReferences: {
              ...references,
              connectedAccounts: [connectedAccount({ scope: 'USER' })],
            },
          }),
        ).toEqual({ manifest });
      });

      it.each(['{{trigger.properties.after.assigneeId}}', WORKSPACE_MEMBER_ID])(
        'keeps the account value %s as it was declared',
        (connectedAccountId) => {
          expectRoundTrip(sendEmailWorkflow({ connectedAccountId }));
        },
      );
    });

    it('omits values the sync derives', () => {
      const result = exportWorkflow(
        syncWorkflow(
          buildWorkflow({
            steps: [
              buildStep({
                type: 'HTTP_REQUEST',
                overrides: {
                  position: { x: 0, y: 180 },
                  expectedOutputSchema: { ok: true },
                  errorHandlingOptions: {
                    retryOnFailure: { value: 0 },
                    continueOnFailure: { value: false },
                  },
                },
              }),
            ],
          }),
        ),
      );

      expect(result).toEqual({
        manifest: buildWorkflow({
          steps: [
            buildStep({
              type: 'HTTP_REQUEST',
              overrides: { expectedOutputSchema: { ok: true } },
            }),
          ],
        }),
      });
    });

    it.each<WorkflowTriggerManifest>([
      {
        ...MANUAL_TRIGGER,
        settings: {
          availability: {
            type: 'SINGLE_RECORD',
            objectUniversalIdentifier: OBJECT_ID,
          },
          icon: 'IconBolt',
          isPinned: true,
        },
      },
      { ...MANUAL_TRIGGER, settings: { availability: { type: 'GLOBAL' } } },
      {
        universalIdentifier: TRIGGER_ID,
        type: 'CRON',
        nextStepIds: [STEP_ID],
        settings: { type: 'HOURS', schedule: { hour: 2, minute: 30 } },
      },
      {
        universalIdentifier: TRIGGER_ID,
        type: 'CRON',
        nextStepIds: [STEP_ID],
        settings: { type: 'CUSTOM', pattern: '0 9 * * 1' },
      },
      {
        universalIdentifier: TRIGGER_ID,
        type: 'WEBHOOK',
        nextStepIds: [STEP_ID],
        settings: { httpMethod: 'GET' },
      },
      {
        universalIdentifier: TRIGGER_ID,
        type: 'WEBHOOK',
        nextStepIds: [STEP_ID],
        settings: {
          httpMethod: 'POST',
          expectedBody: { email: 'jane@example.com' },
        },
      },
      {
        universalIdentifier: TRIGGER_ID,
        type: 'DATABASE_EVENT',
        nextStepIds: [STEP_ID],
        settings: { objectUniversalIdentifier: OBJECT_ID, action: 'created' },
      },
      {
        universalIdentifier: TRIGGER_ID,
        type: 'DATABASE_EVENT',
        nextStepIds: [STEP_ID],
        settings: {
          objectUniversalIdentifier: OBJECT_ID,
          action: 'updated',
          fieldUniversalIdentifiers: [STATUS_FIELD_ID, COMPANY_FIELD_ID],
          filter: STEP_FILTERS,
        },
      },
    ])('exports a $type trigger as it was declared', (trigger) => {
      expectRoundTrip(buildWorkflow({ trigger }));
    });

    it('emits the same source whatever the stored key order', () => {
      const synced = syncWorkflow(
        buildWorkflow({
          trigger: {
            universalIdentifier: TRIGGER_ID,
            type: 'DATABASE_EVENT',
            nextStepIds: [STEP_ID],
            settings: {
              objectUniversalIdentifier: OBJECT_ID,
              action: 'updated',
              filter: STEP_FILTERS,
            },
          },
          steps: [buildStep({ type: 'FIND_RECORDS' })],
        }),
      );
      const reordered = {
        ...synced,
        flatWorkflowVersion: reverseKeysDeeply(synced.flatWorkflowVersion),
      };

      expect(JSON.stringify(exportWorkflow(reordered))).toBe(
        JSON.stringify(exportWorkflow(synced)),
      );
    });
  });

  describe('unsupported workflows', () => {
    it.each([WorkflowActionType.CODE, WorkflowActionType.SEND_CHAT_MESSAGE])(
      'reports a %s step',
      (type) => {
        const synced = syncWorkflow(buildWorkflow({}));
        const [step] = synced.flatWorkflowVersion.steps ?? [];

        Object.assign(step, { type });

        expect(exportWorkflow(synced)).toEqual({
          reason: `${type} steps are not supported in application workflows`,
        });
      },
    );

    it('reports a record filter on a field of a related record', () => {
      const synced = syncWorkflow(
        buildWorkflow({ steps: [buildStep({ type: 'FIND_RECORDS' })] }),
      );
      const [step] = synced.flatWorkflowVersion.steps ?? [];

      if (step?.type !== WorkflowActionType.FIND_RECORDS) {
        throw new Error('Expected a find records step');
      }

      Object.assign(step.settings.input.filter?.recordFilters?.[0] ?? {}, {
        relationTargetFieldMetadataId: 'status-field-id',
      });

      expect(exportWorkflow(synced)).toEqual({
        reason: 'workflow filtering on a field of a related record',
      });
    });

    it('reports a webhook with authentication', () => {
      const synced = syncWorkflow(
        buildWorkflow({
          trigger: {
            universalIdentifier: TRIGGER_ID,
            type: 'WEBHOOK',
            nextStepIds: [STEP_ID],
            settings: { httpMethod: 'GET' },
          },
        }),
      );

      Object.assign(synced.flatWorkflowVersion.triggers?.[0].settings ?? {}, {
        authentication: 'API_KEY',
      });

      expect(exportWorkflow(synced)).toEqual({
        reason: 'webhook trigger with authentication',
      });
    });

    it('reports a manual trigger shown in specific locations', () => {
      const synced = syncWorkflow(
        buildWorkflow({
          trigger: {
            ...MANUAL_TRIGGER,
            settings: { availability: { type: 'GLOBAL' } },
          },
        }),
      );

      Object.assign(synced.flatWorkflowVersion.triggers?.[0].settings ?? {}, {
        availability: { type: 'GLOBAL', locations: ['tasks'] },
      });

      expect(exportWorkflow(synced)).toEqual({
        reason: 'manual trigger available in specific locations',
      });
    });

    it.each([
      {
        description: 'an object that is not exported',
        step: buildStep({ type: 'CREATE_RECORD' }),
        exportReferences: {
          ...references,
          objectByUniversalIdentifier: new Map(),
        },
        reason: 'workflow referencing an object that is not exported',
      },
      {
        description: 'a field that is not exported',
        step: buildStep({ type: 'FILTER' }),
        exportReferences: {
          ...references,
          fieldByUniversalIdentifier: new Map(),
        },
        reason: 'workflow referencing a field that is not exported',
      },
      {
        description:
          'a logic function that is not a workflow action of the application',
        step: buildStep({ type: 'LOGIC_FUNCTION' }),
        exportReferences: {
          ...references,
          logicFunctionIdByUniversalIdentifier: new Map(),
        },
        reason:
          'workflow step on a logic function that is not a workflow action of this application',
      },
      {
        description: 'an agent of another application',
        step: buildStep({ type: 'AI_AGENT' }),
        exportReferences: {
          ...references,
          agentIdByUniversalIdentifier: new Map(),
        },
        reason: 'workflow step on an agent of another application',
      },
    ])(
      'reports a step on $description',
      ({ step, exportReferences, reason }) => {
        expect(
          exportWorkflow({
            ...syncWorkflow(buildWorkflow({ steps: [step] })),
            exportReferences,
          }),
        ).toEqual({ reason });
      },
    );

    it('reports a watched field that is not exported', () => {
      const synced = syncWorkflow(
        buildWorkflow({
          trigger: {
            universalIdentifier: TRIGGER_ID,
            type: 'DATABASE_EVENT',
            nextStepIds: [STEP_ID],
            settings: {
              objectUniversalIdentifier: OBJECT_ID,
              action: 'updated',
              fieldUniversalIdentifiers: [COMPANY_FIELD_ID],
            },
          },
        }),
      );

      expect(
        exportWorkflow({
          ...synced,
          exportReferences: {
            ...references,
            fieldByUniversalIdentifier: new Map(),
          },
        }),
      ).toEqual({ reason: 'workflow watching a field that is not exported' });
    });

    it.each([
      {
        case: 'an archived account',
        account: connectedAccount({ archivedAt: new Date() }),
        reason: `workflow step on archived connected account ${SALES_HANDLE}`,
      },
      {
        case: 'an account that cannot send email',
        account: connectedAccount({ provider: ConnectedAccountProvider.OIDC }),
        reason: `workflow step on connected account ${SALES_HANDLE}, which cannot send email`,
      },
    ])('reports a step on $case', ({ account, reason }) => {
      const synced = syncWorkflow(
        buildWorkflow({ steps: [buildStep({ type: 'SEND_EMAIL' })] }),
      );

      expect(
        exportWorkflow({
          ...synced,
          exportReferences: { ...references, connectedAccounts: [account] },
        }),
      ).toEqual({ reason });
    });

    it('reports a calendar step on an account whose calendar sync is disabled', () => {
      const synced = syncWorkflow(
        buildWorkflow({
          steps: [buildStep({ type: 'CREATE_CALENDAR_EVENT' })],
        }),
      );

      expect(
        exportWorkflow({
          ...synced,
          exportReferences: {
            ...references,
            connectedAccounts: [
              connectedAccount({
                calendarChannels: [{ isSyncEnabled: false }],
              }),
            ],
          },
        }),
      ).toEqual({
        reason: `workflow step on connected account ${SALES_HANDLE}, which cannot create calendar events`,
      });
    });

    it('reports a step on an account whose handle names an older account', () => {
      const synced = syncWorkflow(
        sendEmailWorkflow({ connectedAccountId: 'sales-account-id' }),
      );

      expect(
        exportWorkflow({
          ...synced,
          exportReferences: {
            ...references,
            connectedAccounts: [
              connectedAccount({ id: 'older-account-id' }),
              connectedAccount({}),
            ],
          },
        }),
      ).toEqual({
        reason: `workflow step on connected account ${SALES_HANDLE}, whose handle names an older account of the workspace`,
      });
    });

    it('reports a version the sync would not reproduce', () => {
      const synced = syncWorkflow(buildWorkflow({}));
      const trigger = synced.flatWorkflowVersion.triggers?.[0];

      if (!isDefined(trigger)) {
        throw new Error('Expected the synced version to have a trigger');
      }

      Object.assign(trigger, { name: 'Renamed in the builder' });

      expect(exportWorkflow(synced)).toEqual({
        reason: 'workflow changed in the workflow builder',
      });
    });
  });
});
