import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ViewKey } from 'twenty-shared/types';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { computeTwentyStandardApplicationAllFlatEntityMapsPre231 } from 'src/database/commands/upgrade-version-command/2-10/utils/compute-twenty-standard-application-all-flat-entity-maps-pre-2-31.util';
import { toPre231RecordPageUniversalIdentifier } from 'src/database/commands/upgrade-version-command/2-10/utils/remap-record-page-universal-identifiers-to-pre-2-31.util';
import { SyncCallRecordingRequestStatusCommand } from 'src/database/commands/upgrade-version-command/2-14/2-14-workspace-command-1799000065000-sync-call-recording-request-status.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

jest.mock(
  'src/database/commands/upgrade-version-command/2-10/utils/compute-twenty-standard-application-all-flat-entity-maps-pre-2-31.util',
);

const computeTwentyStandardApplicationAllFlatEntityMapsPre231Mock = jest.mocked(
  computeTwentyStandardApplicationAllFlatEntityMapsPre231,
);

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const STANDARD_APPLICATION = {
  id: '20202020-0000-0000-0000-0000000000aa',
  universalIdentifier: '20202020-0000-0000-0000-0000000000bb',
};
const CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-0000-0000-0000000000cc';

const CALL_RECORDING = STANDARD_OBJECTS.callRecording;
const FIELD_UNIVERSAL_IDENTIFIER =
  CALL_RECORDING.fields.recordingRequestStatus.universalIdentifier;
const DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER =
  CALL_RECORDING.views.allCallRecordings.universalIdentifier;
const INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  CALL_RECORDING.views.allCallRecordings.viewFields.recordingRequestStatus
    .universalIdentifier;
const RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER =
  toPre231RecordPageUniversalIdentifier(
    CALL_RECORDING.views.callRecordingRecordPageFields.universalIdentifier,
  );
const RECORD_PAGE_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  toPre231RecordPageUniversalIdentifier(
    CALL_RECORDING.views.callRecordingRecordPageFields.viewFields
      .recordingRequestStatus.universalIdentifier,
  );
const PRE_2_26_INDEX_VIEW_UNIVERSAL_IDENTIFIER =
  'c395b55e-88f0-4d5b-a1fb-0d38b50e0b19';
const CUSTOM_INDEX_VIEW_UNIVERSAL_IDENTIFIER =
  '20202020-0000-0000-0000-000000000020';
const LEGACY_INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-0000-0000-0000-000000000030';

type TestView = {
  universalIdentifier: string;
  applicationUniversalIdentifier?: string;
};

type TestViewField = {
  universalIdentifier: string;
  viewUniversalIdentifier: string;
};

const buildMaps = <TEntity extends { universalIdentifier: string }>(
  entities: TEntity[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
});

describe('SyncCallRecordingRequestStatusCommand', () => {
  let command: SyncCallRecordingRequestStatusCommand;
  let getOrRecomputeMock: jest.Mock;
  let validateBuildAndRunLegacyWorkspaceMigrationMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    getOrRecomputeMock = jest.fn();
    validateBuildAndRunLegacyWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    computeTwentyStandardApplicationAllFlatEntityMapsPre231Mock.mockReturnValue(
      {
        flatFieldMetadataMaps: buildMaps([
          { universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER },
        ]),
        flatViewFieldMaps: buildMaps([
          {
            universalIdentifier: INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
            viewUniversalIdentifier: DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          },
          {
            universalIdentifier: RECORD_PAGE_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
            viewUniversalIdentifier: RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          },
        ]),
      } as unknown as ReturnType<
        typeof computeTwentyStandardApplicationAllFlatEntityMapsPre231
      >,
    );

    command = new SyncCallRecordingRequestStatusCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
          .fn()
          .mockResolvedValue({
            twentyStandardFlatApplication: STANDARD_APPLICATION,
          }),
      } as unknown as ApplicationService,
      {
        getOrRecompute: getOrRecomputeMock,
      } as unknown as WorkspaceCacheService,
      {
        validateBuildAndRunLegacyWorkspaceMigration:
          validateBuildAndRunLegacyWorkspaceMigrationMock,
      } as unknown as WorkspaceMigrationValidateBuildAndRunService,
    );
  });

  const runOnWorkspace = () =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
    });

  const mockWorkspaceCache = ({
    indexViews = [],
    viewFields = [],
    hasField = false,
  }: {
    indexViews?: TestView[];
    viewFields?: TestViewField[];
    hasField?: boolean;
  }) => {
    getOrRecomputeMock.mockResolvedValue({
      flatObjectMetadataMaps: buildMaps([
        {
          universalIdentifier: CALL_RECORDING.universalIdentifier,
          applicationUniversalIdentifier:
            STANDARD_APPLICATION.universalIdentifier,
          viewUniversalIdentifiers: indexViews.map(
            ({ universalIdentifier }) => universalIdentifier,
          ),
        },
      ]),
      flatFieldMetadataMaps: buildMaps(
        hasField ? [{ universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER }] : [],
      ),
      flatViewMaps: buildMaps(
        indexViews.map((indexView) => ({
          applicationUniversalIdentifier:
            STANDARD_APPLICATION.universalIdentifier,
          ...indexView,
          key: ViewKey.INDEX,
          deletedAt: null,
        })),
      ),
      flatViewFieldMaps: buildMaps(
        viewFields.map((viewField) => ({
          ...viewField,
          fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          deletedAt: null,
        })),
      ),
    });
  };

  const expectViewFieldsCreated = (
    expectedViewFields: {
      universalIdentifier: string;
      viewUniversalIdentifier: string;
    }[],
  ) => {
    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).toHaveBeenCalledTimes(1);
    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: WORKSPACE_ID,
        allFlatEntityOperationByMetadataName: expect.objectContaining({
          viewField: expect.objectContaining({
            flatEntityToCreate: expectedViewFields.map((expectedViewField) =>
              expect.objectContaining(expectedViewField),
            ),
          }),
        }),
      }),
    );
  };

  const RECORD_PAGE_VIEW_FIELD = {
    universalIdentifier: RECORD_PAGE_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
    viewUniversalIdentifier: RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
  };

  it('attaches the index view field to a view still holding its pre-2.26 universal identifier', async () => {
    mockWorkspaceCache({
      indexViews: [
        { universalIdentifier: PRE_2_26_INDEX_VIEW_UNIVERSAL_IDENTIFIER },
      ],
    });

    await runOnWorkspace();

    expectViewFieldsCreated([
      {
        universalIdentifier: INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
        viewUniversalIdentifier: PRE_2_26_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
      },
      RECORD_PAGE_VIEW_FIELD,
    ]);
  });

  it('attaches the index view field to a view already on its derived universal identifier', async () => {
    mockWorkspaceCache({
      indexViews: [
        { universalIdentifier: DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER },
      ],
    });

    await runOnWorkspace();

    expectViewFieldsCreated([
      {
        universalIdentifier: INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
        viewUniversalIdentifier: DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
      },
      RECORD_PAGE_VIEW_FIELD,
    ]);
  });

  it('ignores an index view attributed to another application than the object', async () => {
    mockWorkspaceCache({
      indexViews: [
        {
          universalIdentifier: CUSTOM_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
          applicationUniversalIdentifier:
            CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
        { universalIdentifier: PRE_2_26_INDEX_VIEW_UNIVERSAL_IDENTIFIER },
      ],
    });

    await runOnWorkspace();

    expectViewFieldsCreated([
      {
        universalIdentifier: INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
        viewUniversalIdentifier: PRE_2_26_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
      },
      RECORD_PAGE_VIEW_FIELD,
    ]);
  });

  it('does not duplicate a column the index view already displays', async () => {
    mockWorkspaceCache({
      hasField: true,
      indexViews: [
        { universalIdentifier: PRE_2_26_INDEX_VIEW_UNIVERSAL_IDENTIFIER },
      ],
      viewFields: [
        {
          universalIdentifier: LEGACY_INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
          viewUniversalIdentifier: PRE_2_26_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
        },
      ],
    });

    await runOnWorkspace();

    expectViewFieldsCreated([RECORD_PAGE_VIEW_FIELD]);
  });

  it('still creates the field and record page view field when the object has no index view', async () => {
    mockWorkspaceCache({});

    await runOnWorkspace();

    expectViewFieldsCreated([RECORD_PAGE_VIEW_FIELD]);
    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        allFlatEntityOperationByMetadataName: expect.objectContaining({
          fieldMetadata: expect.objectContaining({
            flatEntityToCreate: [
              expect.objectContaining({
                universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
              }),
            ],
          }),
        }),
      }),
    );
  });
});
