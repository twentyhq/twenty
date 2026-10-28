import { type WorkflowManifest } from 'twenty-shared/application';
import { WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { fromWorkflowManifestToUniversalFlatWorkflowOrThrow } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-manifest-to-universal-flat-workflow-or-throw.util';
import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { reconstructWorkflowsManifest } from 'src/engine/core-modules/application/application-manifest/utils/reconstruct-workflows-manifest.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';

const APP_ID = 'application-id';
const OTHER_APP_ID = 'other-application-id';
const WORKSPACE_ID = 'workspace-id';
const NOW = '2026-10-26T00:00:00.000Z';
const APP_UID = '11111111-1111-4111-8111-111111111111';
const TICKET_UID = '22222222-2222-4222-8222-222222222222';
const UNEXPORTED_OBJECT_UID = '33333333-3333-4333-8333-333333333333';
const COMPANY_UID = '44444444-4444-4444-8444-444444444444';
const ACTION_FUNCTION_UID = '55555555-5555-4555-8555-555555555555';
const PLAIN_FUNCTION_UID = '66666666-6666-4666-8666-666666666666';
const OTHER_APPLICATION_FUNCTION_UID = '99999999-9999-4999-8999-999999999999';
const TRIGGER_UID = '77777777-7777-4777-8777-777777777777';
const STEP_UID = '88888888-8888-4888-8888-888888888888';

const buildObject = ({
  universalIdentifier,
  applicationId,
  nameSingular,
}: {
  universalIdentifier: string;
  applicationId: string;
  nameSingular: string;
}): FlatObjectMetadata =>
  getFlatObjectMetadataMock({
    universalIdentifier,
    applicationId,
    applicationUniversalIdentifier: APP_UID,
    nameSingular,
    namePlural: `${nameSingular}s`,
  });

const ticketObject = buildObject({
  universalIdentifier: TICKET_UID,
  applicationId: APP_ID,
  nameSingular: 'ticket',
});
const unexportedObject = buildObject({
  universalIdentifier: UNEXPORTED_OBJECT_UID,
  applicationId: APP_ID,
  nameSingular: 'draft',
});
const companyObject = buildObject({
  universalIdentifier: COMPANY_UID,
  applicationId: OTHER_APP_ID,
  nameSingular: 'company',
});

const buildLogicFunction = ({
  universalIdentifier,
  isWorkflowAction,
  applicationId = APP_ID,
}: {
  universalIdentifier: string;
  isWorkflowAction: boolean;
  applicationId?: string;
}) =>
  ({
    id: `${universalIdentifier}-id`,
    universalIdentifier,
    applicationId,
    applicationUniversalIdentifier: APP_UID,
    workflowActionTriggerSettings: isWorkflowAction ? {} : null,
  }) as FlatLogicFunction;

const logicFunctions = [
  buildLogicFunction({
    universalIdentifier: ACTION_FUNCTION_UID,
    isWorkflowAction: true,
  }),
  buildLogicFunction({
    universalIdentifier: PLAIN_FUNCTION_UID,
    isWorkflowAction: false,
  }),
];
const otherApplicationActionFunction = buildLogicFunction({
  universalIdentifier: OTHER_APPLICATION_FUNCTION_UID,
  isWorkflowAction: true,
  applicationId: OTHER_APP_ID,
});

const createRecordWorkflow = ({
  universalIdentifier,
  objectUniversalIdentifier,
}: {
  universalIdentifier: string;
  objectUniversalIdentifier: string;
}): WorkflowManifest => ({
  universalIdentifier,
  name: `Workflow ${universalIdentifier.slice(0, 2)}`,
  version: {
    trigger: {
      universalIdentifier: TRIGGER_UID,
      type: 'MANUAL',
      nextStepIds: [STEP_UID],
    },
    steps: [
      {
        universalIdentifier: STEP_UID,
        name: 'Create',
        type: 'CREATE_RECORD',
        nextStepIds: [],
        input: { objectUniversalIdentifier, objectRecord: {} },
      },
    ],
  },
});

const logicFunctionWorkflow = ({
  universalIdentifier,
  logicFunctionUniversalIdentifier,
}: {
  universalIdentifier: string;
  logicFunctionUniversalIdentifier: string;
}): WorkflowManifest => ({
  universalIdentifier,
  name: `Workflow ${universalIdentifier.slice(0, 2)}`,
  version: {
    trigger: {
      universalIdentifier: TRIGGER_UID,
      type: 'MANUAL',
      nextStepIds: [STEP_UID],
    },
    steps: [
      {
        universalIdentifier: STEP_UID,
        name: 'Run',
        type: 'LOGIC_FUNCTION',
        logicFunctionUniversalIdentifier,
        nextStepIds: [],
        input: { greeting: 'Hello' },
      },
    ],
  },
});

const syncWorkflow = ({
  manifest,
  workflowOverrides = {},
  versionOverrides = {},
}: {
  manifest: WorkflowManifest;
  workflowOverrides?: Partial<FlatWorkflow>;
  versionOverrides?: Partial<FlatWorkflowVersion>;
}): {
  flatWorkflow: FlatWorkflow;
  flatWorkflowVersion: FlatWorkflowVersion;
} => {
  const { flatUniversalWorkflowVersion, ...universalFlatWorkflow } =
    fromWorkflowManifestToUniversalFlatWorkflowOrThrow({
      manifest,
      applicationUniversalIdentifier: APP_UID,
      now: NOW,
      logicFunctionIdByUniversalIdentifier: new Map(
        [...logicFunctions, otherApplicationActionFunction].map(
          ({ universalIdentifier, id }) => [universalIdentifier, id],
        ),
      ),
      objectByUniversalIdentifier: new Map(
        [ticketObject, unexportedObject, companyObject].map((object) => [
          object.universalIdentifier,
          object,
        ]),
      ),
    });

  if (!isDefined(flatUniversalWorkflowVersion)) {
    throw new Error('Expected the synced workflow version');
  }

  return {
    flatWorkflow: {
      ...universalFlatWorkflow,
      workspaceId: WORKSPACE_ID,
      applicationId: APP_ID,
      ...workflowOverrides,
    },
    flatWorkflowVersion: {
      ...flatUniversalWorkflowVersion,
      workspaceId: WORKSPACE_ID,
      applicationId: APP_ID,
      ...versionOverrides,
    },
  };
};

const buildMaps = ({
  objects = [],
  flatLogicFunctions = logicFunctions,
  synced,
}: {
  objects?: FlatObjectMetadata[];
  flatLogicFunctions?: FlatLogicFunction[];
  synced: ReturnType<typeof syncWorkflow>[];
}): AllFlatEntityMaps => {
  const maps = createEmptyAllFlatEntityMaps();

  return {
    ...maps,
    flatObjectMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: objects,
      flatEntityMaps: maps.flatObjectMetadataMaps,
    }),
    flatLogicFunctionMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: flatLogicFunctions,
      flatEntityMaps: maps.flatLogicFunctionMaps,
    }),
    flatWorkflowMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: synced.map(({ flatWorkflow }) => flatWorkflow),
      flatEntityMaps: maps.flatWorkflowMaps,
    }),
    flatWorkflowVersionMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: synced.map(
        ({ flatWorkflowVersion }) => flatWorkflowVersion,
      ),
      flatEntityMaps: maps.flatWorkflowVersionMaps,
    }),
  };
};

const reconstruct = ({
  synced,
  isWorkspaceCustomApplication = false,
}: {
  synced: ReturnType<typeof syncWorkflow>[];
  isWorkspaceCustomApplication?: boolean;
}) =>
  reconstructWorkflowsManifest({
    applicationAllFlatEntityMaps: buildMaps({
      objects: [ticketObject, unexportedObject],
      synced,
    }),
    allFlatEntityMaps: buildMaps({
      objects: [ticketObject, unexportedObject, companyObject],
      flatLogicFunctions: [...logicFunctions, otherApplicationActionFunction],
      synced,
    }),
    exportedObjectUniversalIdentifiers: new Set([TICKET_UID]),
    resolvableFieldUniversalIdentifiers: new Set(),
    isWorkspaceCustomApplication,
  });

describe('reconstructWorkflowsManifest', () => {
  it('exports workflows on exported objects, other applications objects and workflow action functions', () => {
    const manifests = [
      createRecordWorkflow({
        universalIdentifier: 'a0000000-0000-4000-8000-000000000000',
        objectUniversalIdentifier: TICKET_UID,
      }),
      createRecordWorkflow({
        universalIdentifier: 'a1000000-0000-4000-8000-000000000000',
        objectUniversalIdentifier: COMPANY_UID,
      }),
      logicFunctionWorkflow({
        universalIdentifier: 'a2000000-0000-4000-8000-000000000000',
        logicFunctionUniversalIdentifier: ACTION_FUNCTION_UID,
      }),
    ];

    const { workflows, coverage } = reconstruct({
      synced: manifests.map((manifest) => syncWorkflow({ manifest })),
    });

    expect(workflows).toEqual(manifests);
    expect(coverage).toEqual(
      manifests.map(({ universalIdentifier }) => ({
        metadataName: 'workflow',
        universalIdentifier,
        status: ApplicationExportCoverageStatus.EXPORTED,
      })),
    );
  });

  it('reports every workflow it does not export', () => {
    const manifest = (universalIdentifier: string) =>
      createRecordWorkflow({
        universalIdentifier,
        objectUniversalIdentifier: TICKET_UID,
      });
    const synced = [
      syncWorkflow({
        manifest: manifest('b0000000-0000-4000-8000-000000000000'),
        workflowOverrides: { isSystem: true },
      }),
      syncWorkflow({
        manifest: manifest('b1000000-0000-4000-8000-000000000000'),
        workflowOverrides: { visibility: WorkflowVisibility.PRIVATE },
      }),
      syncWorkflow({
        manifest: manifest('b2000000-0000-4000-8000-000000000000'),
        workflowOverrides: { lastPublishedCoreWorkflowVersionId: 'other' },
      }),
      syncWorkflow({
        manifest: manifest('b3000000-0000-4000-8000-000000000000'),
        versionOverrides: { status: WorkflowVersionStatus.DEACTIVATED },
      }),
      syncWorkflow({
        manifest: manifest('b4000000-0000-4000-8000-000000000000'),
        workflowOverrides: { lastPublishedCoreWorkflowVersionId: null },
      }),
      syncWorkflow({
        manifest: createRecordWorkflow({
          universalIdentifier: 'b6000000-0000-4000-8000-000000000000',
          objectUniversalIdentifier: UNEXPORTED_OBJECT_UID,
        }),
      }),
      syncWorkflow({
        manifest: logicFunctionWorkflow({
          universalIdentifier: 'b7000000-0000-4000-8000-000000000000',
          logicFunctionUniversalIdentifier: PLAIN_FUNCTION_UID,
        }),
      }),
    ];

    expect(reconstruct({ synced })).toEqual({
      workflows: [],
      coverage: [
        {
          metadataName: 'workflow',
          universalIdentifier: 'b0000000-0000-4000-8000-000000000000',
          status: ApplicationExportCoverageStatus.EXCLUDED,
          reason: 'system workflow',
        },
        {
          metadataName: 'workflow',
          universalIdentifier: 'b1000000-0000-4000-8000-000000000000',
          status: ApplicationExportCoverageStatus.EXCLUDED,
          reason: 'private workflow',
        },
        ...[
          'b2000000-0000-4000-8000-000000000000',
          'b3000000-0000-4000-8000-000000000000',
          'b4000000-0000-4000-8000-000000000000',
        ].map((universalIdentifier) => ({
          metadataName: 'workflow',
          universalIdentifier,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason: 'workflow changed in the workflow builder',
        })),
        {
          metadataName: 'workflow',
          universalIdentifier: 'b6000000-0000-4000-8000-000000000000',
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason: 'workflow referencing an object that is not exported',
        },
        {
          metadataName: 'workflow',
          universalIdentifier: 'b7000000-0000-4000-8000-000000000000',
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason:
            'workflow step on a logic function that is not a workflow action of this application',
        },
      ],
    });
  });

  it('exports a step on another application action only from the workspace custom application', () => {
    const manifest = logicFunctionWorkflow({
      universalIdentifier: 'd0000000-0000-4000-8000-000000000000',
      logicFunctionUniversalIdentifier: OTHER_APPLICATION_FUNCTION_UID,
    });
    const synced = [syncWorkflow({ manifest })];

    expect(reconstruct({ synced }).coverage).toEqual([
      {
        metadataName: 'workflow',
        universalIdentifier: 'd0000000-0000-4000-8000-000000000000',
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason:
          'workflow step on a logic function that is not a workflow action of this application',
      },
    ]);
    expect(
      reconstruct({
        synced,
        isWorkspaceCustomApplication: true,
      }).workflows,
    ).toEqual([manifest]);
  });

  it('reports a workflow whose synced version is missing', () => {
    const { flatWorkflow } = syncWorkflow({
      manifest: createRecordWorkflow({
        universalIdentifier: 'c0000000-0000-4000-8000-000000000000',
        objectUniversalIdentifier: TICKET_UID,
      }),
    });
    const maps = buildMaps({ objects: [ticketObject], synced: [] });
    const mapsWithWorkflow = {
      ...maps,
      flatWorkflowMaps: addAllFlatEntitiesToFlatEntityMaps({
        flatEntities: [flatWorkflow],
        flatEntityMaps: maps.flatWorkflowMaps,
      }),
    };

    expect(
      reconstructWorkflowsManifest({
        applicationAllFlatEntityMaps: mapsWithWorkflow,
        allFlatEntityMaps: mapsWithWorkflow,
        exportedObjectUniversalIdentifiers: new Set([TICKET_UID]),
        resolvableFieldUniversalIdentifiers: new Set(),
        isWorkspaceCustomApplication: false,
      }).coverage,
    ).toEqual([
      {
        metadataName: 'workflow',
        universalIdentifier: 'c0000000-0000-4000-8000-000000000000',
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: 'workflow changed in the workflow builder',
      },
    ]);
  });

  describe('workspace custom application', () => {
    const builderWorkflow = ({
      universalIdentifier,
      versionOverrides = {},
    }: {
      universalIdentifier: string;
      versionOverrides?: Partial<FlatWorkflowVersion>;
    }) => {
      const builderVersionId = `9${universalIdentifier.slice(1)}`;

      return syncWorkflow({
        manifest: createRecordWorkflow({
          universalIdentifier,
          objectUniversalIdentifier: TICKET_UID,
        }),
        workflowOverrides: {
          lastPublishedCoreWorkflowVersionId: builderVersionId,
          versionDefinitionHash: null,
          workspaceWorkflowId: 'workspace-workflow-id',
          createdByUserWorkspaceId: 'user-workspace-id',
        },
        versionOverrides: {
          id: builderVersionId,
          universalIdentifier: `8${universalIdentifier.slice(1)}`,
          isSystemSideEffect: false,
          workspaceWorkflowVersionId: 'workspace-workflow-version-id',
          ...versionOverrides,
        },
      });
    };

    it('exports the active version published from the workflow builder', () => {
      const synced = builderWorkflow({
        universalIdentifier: 'e0000000-0000-4000-8000-000000000000',
      });

      expect(
        reconstruct({ synced: [synced], isWorkspaceCustomApplication: true }),
      ).toEqual({
        workflows: [
          createRecordWorkflow({
            universalIdentifier: 'e0000000-0000-4000-8000-000000000000',
            objectUniversalIdentifier: TICKET_UID,
          }),
        ],
        coverage: [
          {
            metadataName: 'workflow',
            universalIdentifier: 'e0000000-0000-4000-8000-000000000000',
            status: ApplicationExportCoverageStatus.EXPORTED,
          },
        ],
      });
      expect(reconstruct({ synced: [synced] }).coverage).toEqual([
        {
          metadataName: 'workflow',
          universalIdentifier: 'e0000000-0000-4000-8000-000000000000',
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason: 'workflow changed in the workflow builder',
        },
      ]);
    });

    it('reports a builder workflow without an active version or that a manifest cannot reproduce', () => {
      const deactivated = builderWorkflow({
        universalIdentifier: 'e1000000-0000-4000-8000-000000000000',
        versionOverrides: { status: WorkflowVersionStatus.DEACTIVATED },
      });
      const renamedTrigger = builderWorkflow({
        universalIdentifier: 'e2000000-0000-4000-8000-000000000000',
      });
      const [trigger] = renamedTrigger.flatWorkflowVersion.triggers ?? [];

      renamedTrigger.flatWorkflowVersion = {
        ...renamedTrigger.flatWorkflowVersion,
        triggers: [{ ...trigger, name: 'Launch manually' }],
      };

      expect(
        reconstruct({
          synced: [deactivated, renamedTrigger],
          isWorkspaceCustomApplication: true,
        }),
      ).toEqual({
        workflows: [],
        coverage: [
          {
            metadataName: 'workflow',
            universalIdentifier: 'e1000000-0000-4000-8000-000000000000',
            status: ApplicationExportCoverageStatus.UNSUPPORTED,
            reason: 'workflow without an active version',
          },
          {
            metadataName: 'workflow',
            universalIdentifier: 'e2000000-0000-4000-8000-000000000000',
            status: ApplicationExportCoverageStatus.UNSUPPORTED,
            reason: 'workflow with settings a manifest cannot reproduce',
          },
        ],
      });
    });
  });
});
