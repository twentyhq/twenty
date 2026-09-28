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

const computeTwentyStandardApplicationAllFlatEntityMapsPre231Mock =
  computeTwentyStandardApplicationAllFlatEntityMapsPre231 as jest.Mock;

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const STANDARD_APPLICATION = {
  id: '20202020-0000-0000-0000-0000000000aa',
  universalIdentifier: '20202020-0000-0000-0000-0000000000bb',
};

const CALL_RECORDING = STANDARD_OBJECTS.callRecording;
const FIELD_UNIVERSAL_IDENTIFIER =
  CALL_RECORDING.fields.recordingRequestStatus.universalIdentifier;
const DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER =
  CALL_RECORDING.views.allCallRecordings.universalIdentifier;
const INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  CALL_RECORDING.views.allCallRecordings.viewFields.recordingRequestStatus
    .universalIdentifier;
const RECORD_PAGE_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  toPre231RecordPageUniversalIdentifier(
    CALL_RECORDING.views.callRecordingRecordPageFields.viewFields
      .recordingRequestStatus.universalIdentifier,
  );
const PRE_2_26_INDEX_VIEW_UNIVERSAL_IDENTIFIER =
  'c395b55e-88f0-4d5b-a1fb-0d38b50e0b19';
const PRE_2_26_INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  '3bdedacd-0fd5-4175-8d28-2fe41bb5aa77';

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
            fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          },
        ]),
      },
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
    indexViewUniversalIdentifier,
    indexViewFields = [],
  }: {
    indexViewUniversalIdentifier?: string;
    indexViewFields?: {
      universalIdentifier: string;
      fieldMetadataUniversalIdentifier: string;
    }[];
  }) => {
    const indexViews = indexViewUniversalIdentifier
      ? [
          {
            universalIdentifier: indexViewUniversalIdentifier,
            key: ViewKey.INDEX,
            deletedAt: null,
            viewFieldUniversalIdentifiers: indexViewFields.map(
              ({ universalIdentifier }) => universalIdentifier,
            ),
          },
        ]
      : [];

    getOrRecomputeMock.mockResolvedValue({
      flatObjectMetadataMaps: buildMaps([
        {
          universalIdentifier: CALL_RECORDING.universalIdentifier,
          viewUniversalIdentifiers: indexViews.map(
            ({ universalIdentifier }) => universalIdentifier,
          ),
        },
      ]),
      flatFieldMetadataMaps: buildMaps([]),
      flatViewMaps: buildMaps(indexViews),
      flatViewFieldMaps: buildMaps(
        indexViewFields.map((indexViewField) => ({
          ...indexViewField,
          deletedAt: null,
        })),
      ),
    });
  };

  const getViewFieldsToCreate = () =>
    validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls[0][0]
      .allFlatEntityOperationByMetadataName.viewField.flatEntityToCreate;

  it('attaches the index view field to a view still holding its pre-2.26 universal identifier', async () => {
    mockWorkspaceCache({
      indexViewUniversalIdentifier: PRE_2_26_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
    });

    await runOnWorkspace();

    expect(getViewFieldsToCreate()).toEqual([
      expect.objectContaining({
        universalIdentifier: INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
        viewUniversalIdentifier: PRE_2_26_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
      }),
      expect.objectContaining({
        universalIdentifier: RECORD_PAGE_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
      }),
    ]);
  });

  it('attaches the index view field to a view already on its derived universal identifier', async () => {
    mockWorkspaceCache({
      indexViewUniversalIdentifier: DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
    });

    await runOnWorkspace();

    expect(getViewFieldsToCreate()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          universalIdentifier: INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
          viewUniversalIdentifier: DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
        }),
      ]),
    );
  });

  it('does not duplicate a column the index view already displays', async () => {
    mockWorkspaceCache({
      indexViewUniversalIdentifier: PRE_2_26_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
      indexViewFields: [
        {
          universalIdentifier: PRE_2_26_INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
          fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
        },
      ],
    });

    await runOnWorkspace();

    expect(getViewFieldsToCreate()).toEqual([
      expect.objectContaining({
        universalIdentifier: RECORD_PAGE_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
      }),
    ]);
  });

  it('skips the index view field when the object has no index view', async () => {
    mockWorkspaceCache({});

    await runOnWorkspace();

    expect(getViewFieldsToCreate()).toEqual([
      expect.objectContaining({
        universalIdentifier: RECORD_PAGE_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
      }),
    ]);
  });
});
