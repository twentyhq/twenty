import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { AddMessageCampaignStatFieldsCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783525261000-add-message-campaign-stat-fields.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

jest.mock(
  'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant',
);

const computeTwentyStandardApplicationAllFlatEntityMapsMock =
  computeTwentyStandardApplicationAllFlatEntityMaps as jest.Mock;

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const STANDARD_APPLICATION = {
  id: '20202020-0000-0000-0000-0000000000aa',
  universalIdentifier: '20202020-0000-0000-0000-0000000000bb',
};

const CAMPAIGN = STANDARD_OBJECTS.messageCampaign;
const STAT_FIELD_UNIVERSAL_IDENTIFIERS = [
  CAMPAIGN.fields.sentCount.universalIdentifier,
  CAMPAIGN.fields.failedCount.universalIdentifier,
  CAMPAIGN.fields.bouncedCount.universalIdentifier,
  CAMPAIGN.fields.complainedCount.universalIdentifier,
];
const CAMPAIGN_VIEW_UNIVERSAL_IDENTIFIER =
  CAMPAIGN.views.allMessageCampaigns.universalIdentifier;
const CAMPAIGN_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = Object.values(
  CAMPAIGN.views.allMessageCampaigns.viewFields,
).map((viewField) => viewField.universalIdentifier);

const buildByUniversalIdentifierMap = (universalIdentifiers: string[]) => ({
  byUniversalIdentifier: Object.fromEntries(
    universalIdentifiers.map((universalIdentifier) => [
      universalIdentifier,
      { universalIdentifier },
    ]),
  ),
});

describe('AddMessageCampaignStatFieldsCommand', () => {
  let command: AddMessageCampaignStatFieldsCommand;
  let findApplicationMock: jest.Mock;
  let getOrRecomputeMock: jest.Mock;
  let validateBuildAndRunWorkspaceMigrationMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    findApplicationMock = jest.fn().mockResolvedValue({
      twentyStandardFlatApplication: STANDARD_APPLICATION,
    });
    getOrRecomputeMock = jest.fn();
    validateBuildAndRunWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    computeTwentyStandardApplicationAllFlatEntityMapsMock.mockReturnValue({
      allFlatEntityMaps: {
        flatFieldMetadataMaps: buildByUniversalIdentifierMap(
          STAT_FIELD_UNIVERSAL_IDENTIFIERS,
        ),
        flatViewMaps: buildByUniversalIdentifierMap([
          CAMPAIGN_VIEW_UNIVERSAL_IDENTIFIER,
        ]),
        flatViewFieldMaps: buildByUniversalIdentifierMap(
          CAMPAIGN_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
        ),
      },
    });

    command = new AddMessageCampaignStatFieldsCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow:
          findApplicationMock,
      } as unknown as ApplicationService,
      {
        getOrRecompute: getOrRecomputeMock,
      } as unknown as WorkspaceCacheService,
      {
        validateBuildAndRunWorkspaceMigration:
          validateBuildAndRunWorkspaceMigrationMock,
      } as unknown as WorkspaceMigrationValidateBuildAndRunService,
    );
  });

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  const mockWorkspaceCache = ({
    existingFields = [],
    existingViews = [],
    existingViewFields = [],
  }: {
    existingFields?: string[];
    existingViews?: string[];
    existingViewFields?: string[];
  }) => {
    getOrRecomputeMock.mockResolvedValue({
      flatObjectMetadataMaps: buildByUniversalIdentifierMap([
        CAMPAIGN.universalIdentifier,
      ]),
      flatFieldMetadataMaps: buildByUniversalIdentifierMap(existingFields),
      flatViewMaps: buildByUniversalIdentifierMap(existingViews),
      flatViewFieldMaps: buildByUniversalIdentifierMap(existingViewFields),
    });
  };

  it('creates missing stat fields, the campaign view, and all campaign view fields', async () => {
    mockWorkspaceCache({});

    await runOnWorkspace();

    expect(validateBuildAndRunWorkspaceMigrationMock).toHaveBeenCalledWith({
      isSystemBuild: true,
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: STANDARD_APPLICATION.universalIdentifier,
      allFlatEntityOperationByMetadataName: {
        fieldMetadata: {
          flatEntityToCreate: expect.arrayContaining(
            STAT_FIELD_UNIVERSAL_IDENTIFIERS.map((universalIdentifier) =>
              expect.objectContaining({ universalIdentifier }),
            ),
          ),
          flatEntityToDelete: [],
          flatEntityToUpdate: [],
        },
        view: {
          flatEntityToCreate: [
            expect.objectContaining({
              universalIdentifier: CAMPAIGN_VIEW_UNIVERSAL_IDENTIFIER,
            }),
          ],
          flatEntityToDelete: [],
          flatEntityToUpdate: [],
        },
        viewField: {
          flatEntityToCreate: expect.arrayContaining(
            CAMPAIGN_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.map(
              (universalIdentifier) =>
                expect.objectContaining({ universalIdentifier }),
            ),
          ),
          flatEntityToDelete: [],
          flatEntityToUpdate: [],
        },
      },
    });
    expect(
      validateBuildAndRunWorkspaceMigrationMock.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName.fieldMetadata.flatEntityToCreate,
    ).toHaveLength(STAT_FIELD_UNIVERSAL_IDENTIFIERS.length);
    expect(
      validateBuildAndRunWorkspaceMigrationMock.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName.viewField.flatEntityToCreate,
    ).toHaveLength(CAMPAIGN_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.length);
  });

  it('creates only missing pieces when rerun against a partially migrated workspace', async () => {
    mockWorkspaceCache({
      existingFields: [CAMPAIGN.fields.sentCount.universalIdentifier],
      existingViews: [CAMPAIGN_VIEW_UNIVERSAL_IDENTIFIER],
      existingViewFields: [
        CAMPAIGN.views.allMessageCampaigns.viewFields.subject
          .universalIdentifier,
      ],
    });

    await runOnWorkspace();

    const payload =
      validateBuildAndRunWorkspaceMigrationMock.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName;

    expect(payload.fieldMetadata.flatEntityToCreate).toEqual(
      expect.arrayContaining(
        STAT_FIELD_UNIVERSAL_IDENTIFIERS.slice(1).map((universalIdentifier) =>
          expect.objectContaining({ universalIdentifier }),
        ),
      ),
    );
    expect(payload.fieldMetadata.flatEntityToCreate).toHaveLength(
      STAT_FIELD_UNIVERSAL_IDENTIFIERS.length - 1,
    );
    expect(payload.view.flatEntityToCreate).toEqual([]);
    expect(payload.viewField.flatEntityToCreate).toHaveLength(
      CAMPAIGN_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.length - 1,
    );
  });

  it('skips the metadata migration when everything already exists', async () => {
    mockWorkspaceCache({
      existingFields: STAT_FIELD_UNIVERSAL_IDENTIFIERS,
      existingViews: [CAMPAIGN_VIEW_UNIVERSAL_IDENTIFIER],
      existingViewFields: CAMPAIGN_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
    });

    await runOnWorkspace();

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('does not write metadata in dry-run mode', async () => {
    mockWorkspaceCache({});

    await runOnWorkspace(true);

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('skips workspaces where the messageCampaign object is absent', async () => {
    getOrRecomputeMock.mockResolvedValue({
      flatObjectMetadataMaps: buildByUniversalIdentifierMap([]),
      flatFieldMetadataMaps: buildByUniversalIdentifierMap([]),
      flatViewMaps: buildByUniversalIdentifierMap([]),
      flatViewFieldMaps: buildByUniversalIdentifierMap([]),
    });

    await runOnWorkspace();

    expect(findApplicationMock).not.toHaveBeenCalled();
    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });
});
