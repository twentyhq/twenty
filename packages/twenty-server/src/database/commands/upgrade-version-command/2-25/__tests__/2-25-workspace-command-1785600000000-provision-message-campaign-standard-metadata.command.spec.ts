import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ProvisionMessageCampaignStandardMetadataCommand } from 'src/database/commands/upgrade-version-command/2-25/2-25-workspace-command-1785600000000-provision-message-campaign-standard-metadata.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const STANDARD_APPLICATION = {
  id: '20202020-0000-0000-0000-0000000000aa',
  universalIdentifier: '20202020-0000-0000-0000-0000000000bb',
};

const buildByUniversalIdentifierMap = (
  universalIdentifiers: string[] = [],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    universalIdentifiers.map((universalIdentifier) => [
      universalIdentifier,
      { universalIdentifier },
    ]),
  ),
});

const buildEmptyWorkspaceCache = () => ({
  flatFieldMetadataMaps: buildByUniversalIdentifierMap(),
  flatIndexMaps: buildByUniversalIdentifierMap(),
  flatObjectMetadataMaps: buildByUniversalIdentifierMap(),
  flatPageLayoutMaps: buildByUniversalIdentifierMap(),
  flatPageLayoutTabMaps: buildByUniversalIdentifierMap(),
  flatPageLayoutWidgetMaps: buildByUniversalIdentifierMap(),
  flatViewFieldMaps: buildByUniversalIdentifierMap(),
  flatViewMaps: buildByUniversalIdentifierMap(),
});

describe('ProvisionMessageCampaignStandardMetadataCommand', () => {
  let command: ProvisionMessageCampaignStandardMetadataCommand;
  let getOrRecomputeMock: jest.Mock;
  let validateBuildAndRunWorkspaceMigrationMock: jest.Mock;

  beforeEach(() => {
    getOrRecomputeMock = jest
      .fn()
      .mockResolvedValue(buildEmptyWorkspaceCache());
    validateBuildAndRunWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    command = new ProvisionMessageCampaignStandardMetadataCommand(
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

  it('creates the campaign, list, and member metadata graph', async () => {
    await runOnWorkspace();

    const payload =
      validateBuildAndRunWorkspaceMigrationMock.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName;

    expect(payload.objectMetadata.flatEntityToCreate).toEqual(
      expect.arrayContaining(
        [
          STANDARD_OBJECTS.messageCampaign.universalIdentifier,
          STANDARD_OBJECTS.messageList.universalIdentifier,
          STANDARD_OBJECTS.messageListMember.universalIdentifier,
        ].map((universalIdentifier) =>
          expect.objectContaining({ universalIdentifier }),
        ),
      ),
    );
    expect(payload.objectMetadata.flatEntityToCreate).toHaveLength(3);
    expect(payload.fieldMetadata.flatEntityToCreate).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          universalIdentifier:
            STANDARD_OBJECTS.messageCampaign.fields.subject.universalIdentifier,
        }),
        expect.objectContaining({
          universalIdentifier:
            STANDARD_OBJECTS.person.fields.listMemberships.universalIdentifier,
        }),
        expect.objectContaining({
          universalIdentifier:
            STANDARD_OBJECTS.message.fields.messageCampaign.universalIdentifier,
        }),
      ]),
    );
    expect(payload.index.flatEntityToCreate).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          universalIdentifier:
            STANDARD_OBJECTS.messageCampaign.indexes.listIdIndex
              .universalIdentifier,
        }),
        expect.objectContaining({
          universalIdentifier:
            STANDARD_OBJECTS.message.indexes.messageCampaignIdIndex
              .universalIdentifier,
        }),
      ]),
    );
    expect(payload.view.flatEntityToCreate).toHaveLength(2);
    expect(payload.viewField.flatEntityToCreate).toHaveLength(16);
    expect(payload.pageLayout.flatEntityToCreate).toHaveLength(2);
    expect(payload.pageLayoutTab.flatEntityToCreate).toHaveLength(2);
    expect(payload.pageLayoutWidget.flatEntityToCreate).toHaveLength(6);

    for (const operations of Object.values(payload) as Array<{
      flatEntityToDelete: unknown[];
      flatEntityToUpdate: unknown[];
    }>) {
      expect(operations.flatEntityToDelete).toEqual([]);
      expect(operations.flatEntityToUpdate).toEqual([]);
    }
  });

  it('creates only missing metadata on a partially provisioned workspace', async () => {
    getOrRecomputeMock.mockResolvedValue({
      ...buildEmptyWorkspaceCache(),
      flatObjectMetadataMaps: buildByUniversalIdentifierMap([
        STANDARD_OBJECTS.messageCampaign.universalIdentifier,
      ]),
      flatFieldMetadataMaps: buildByUniversalIdentifierMap([
        STANDARD_OBJECTS.messageCampaign.fields.subject.universalIdentifier,
      ]),
      flatViewMaps: buildByUniversalIdentifierMap([
        STANDARD_OBJECTS.messageCampaign.views.allMessageCampaigns
          .universalIdentifier,
      ]),
    });

    await runOnWorkspace();

    const payload =
      validateBuildAndRunWorkspaceMigrationMock.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName;

    expect(payload.objectMetadata.flatEntityToCreate).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          universalIdentifier:
            STANDARD_OBJECTS.messageCampaign.universalIdentifier,
        }),
      ]),
    );
    expect(payload.fieldMetadata.flatEntityToCreate).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          universalIdentifier:
            STANDARD_OBJECTS.messageCampaign.fields.subject.universalIdentifier,
        }),
      ]),
    );
    expect(payload.view.flatEntityToCreate).toHaveLength(1);
  });

  it('skips the migration when every target entity already exists', async () => {
    await runOnWorkspace();

    const initialPayload =
      validateBuildAndRunWorkspaceMigrationMock.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName;

    getOrRecomputeMock.mockResolvedValue({
      flatObjectMetadataMaps: buildByUniversalIdentifierMap(
        initialPayload.objectMetadata.flatEntityToCreate.map(
          ({ universalIdentifier }: { universalIdentifier: string }) =>
            universalIdentifier,
        ),
      ),
      flatFieldMetadataMaps: buildByUniversalIdentifierMap(
        initialPayload.fieldMetadata.flatEntityToCreate.map(
          ({ universalIdentifier }: { universalIdentifier: string }) =>
            universalIdentifier,
        ),
      ),
      flatIndexMaps: buildByUniversalIdentifierMap(
        initialPayload.index.flatEntityToCreate.map(
          ({ universalIdentifier }: { universalIdentifier: string }) =>
            universalIdentifier,
        ),
      ),
      flatViewMaps: buildByUniversalIdentifierMap(
        initialPayload.view.flatEntityToCreate.map(
          ({ universalIdentifier }: { universalIdentifier: string }) =>
            universalIdentifier,
        ),
      ),
      flatViewFieldMaps: buildByUniversalIdentifierMap(
        initialPayload.viewField.flatEntityToCreate.map(
          ({ universalIdentifier }: { universalIdentifier: string }) =>
            universalIdentifier,
        ),
      ),
      flatPageLayoutMaps: buildByUniversalIdentifierMap(
        initialPayload.pageLayout.flatEntityToCreate.map(
          ({ universalIdentifier }: { universalIdentifier: string }) =>
            universalIdentifier,
        ),
      ),
      flatPageLayoutTabMaps: buildByUniversalIdentifierMap(
        initialPayload.pageLayoutTab.flatEntityToCreate.map(
          ({ universalIdentifier }: { universalIdentifier: string }) =>
            universalIdentifier,
        ),
      ),
      flatPageLayoutWidgetMaps: buildByUniversalIdentifierMap(
        initialPayload.pageLayoutWidget.flatEntityToCreate.map(
          ({ universalIdentifier }: { universalIdentifier: string }) =>
            universalIdentifier,
        ),
      ),
    });
    validateBuildAndRunWorkspaceMigrationMock.mockClear();

    await runOnWorkspace();

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('does not write metadata in dry-run mode', async () => {
    await runOnWorkspace(true);

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });
});
