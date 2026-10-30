import { Test } from '@nestjs/testing';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { AddDirectMessagePairIdentityCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793366004507-add-direct-message-pair-identity.command';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const FIELD_IDENTIFIERS = [
  STANDARD_OBJECTS.agentChatThread.fields.directMessageFirstWorkspaceMemberId
    .universalIdentifier,
  STANDARD_OBJECTS.agentChatThread.fields.directMessageSecondWorkspaceMemberId
    .universalIdentifier,
];
const INDEX_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThread.indexes.directMessagePairUniqueIndex
    .universalIdentifier;
const STANDARD_FLAT_ENTITY_MAPS =
  computeTwentyStandardApplicationAllFlatEntityMaps({
    now: '2026-10-30T00:00:00.000Z',
    workspaceId: WORKSPACE_ID,
    twentyStandardApplicationId: APPLICATION_ID,
  }).allFlatEntityMaps;

const omitFlatEntities = <
  TFlatEntityMaps extends { byUniversalIdentifier: Record<string, unknown> },
>(
  flatEntityMaps: TFlatEntityMaps,
  universalIdentifiers: string[],
) => ({
  ...flatEntityMaps,
  byUniversalIdentifier: removePropertiesFromRecord(
    flatEntityMaps.byUniversalIdentifier,
    universalIdentifiers,
  ),
});

const buildCommand = async ({
  hasPairFields = false,
  hasPairIndex = false,
  hasChatHistory = true,
  migrationStatus = 'success',
}: {
  hasPairFields?: boolean;
  hasPairIndex?: boolean;
  hasChatHistory?: boolean;
  migrationStatus?: 'success' | 'fail';
} = {}) => {
  const findApplications = jest.fn().mockResolvedValue({
    twentyStandardFlatApplication: {
      id: APPLICATION_ID,
      universalIdentifier: APPLICATION_ID,
    },
  });
  const validateBuildAndRunLegacyWorkspaceMigration = jest
    .fn()
    .mockResolvedValue({ status: migrationStatus });
  const moduleRef = await Test.createTestingModule({
    providers: [
      AddDirectMessagePairIdentityCommand,
      { provide: WorkspaceIteratorService, useValue: {} },
      {
        provide: ApplicationService,
        useValue: {
          findWorkspaceTwentyStandardAndCustomApplicationOrThrow:
            findApplications,
        },
      },
      {
        provide: WorkspaceCacheService,
        useValue: {
          getOrRecompute: jest.fn().mockResolvedValue({
            flatObjectMetadataMaps: omitFlatEntities(
              STANDARD_FLAT_ENTITY_MAPS.flatObjectMetadataMaps,
              hasChatHistory
                ? []
                : [STANDARD_OBJECTS.agentChatThread.universalIdentifier],
            ),
            flatFieldMetadataMaps: omitFlatEntities(
              STANDARD_FLAT_ENTITY_MAPS.flatFieldMetadataMaps,
              hasPairFields ? [] : FIELD_IDENTIFIERS,
            ),
            flatIndexMaps: omitFlatEntities(
              STANDARD_FLAT_ENTITY_MAPS.flatIndexMaps,
              hasPairIndex ? [] : [INDEX_IDENTIFIER],
            ),
          }),
        },
      },
      {
        provide: WorkspaceMigrationValidateBuildAndRunService,
        useValue: { validateBuildAndRunLegacyWorkspaceMigration },
      },
    ],
  }).compile();

  return {
    command: moduleRef.get(AddDirectMessagePairIdentityCommand),
    findApplications,
    validateBuildAndRunLegacyWorkspaceMigration,
  };
};

const runCommand = ({
  command,
  dryRun = false,
}: {
  command: AddDirectMessagePairIdentityCommand;
  dryRun?: boolean;
}) =>
  command.runOnWorkspace({
    workspaceId: WORKSPACE_ID,
    options: { dryRun },
    index: 0,
    total: 1,
  });

describe('AddDirectMessagePairIdentityCommand', () => {
  it('adds nullable pair fields and their unique index without rewriting chats', async () => {
    const { command, validateBuildAndRunLegacyWorkspaceMigration } =
      await buildCommand();

    await runCommand({ command });

    expect(validateBuildAndRunLegacyWorkspaceMigration).toHaveBeenCalledTimes(
      1,
    );

    const [{ allFlatEntityOperationByMetadataName }] =
      validateBuildAndRunLegacyWorkspaceMigration.mock.calls[0];

    expect(
      allFlatEntityOperationByMetadataName.fieldMetadata.flatEntityToCreate.map(
        ({ universalIdentifier }: { universalIdentifier: string }) =>
          universalIdentifier,
      ),
    ).toEqual(FIELD_IDENTIFIERS);
    expect(
      allFlatEntityOperationByMetadataName.index.flatEntityToCreate.map(
        ({ universalIdentifier }: { universalIdentifier: string }) =>
          universalIdentifier,
      ),
    ).toEqual([INDEX_IDENTIFIER]);
    expect(allFlatEntityOperationByMetadataName).toMatchObject({
      fieldMetadata: { flatEntityToDelete: [], flatEntityToUpdate: [] },
      index: { flatEntityToDelete: [], flatEntityToUpdate: [] },
    });
  });

  it('repairs a missing index without recreating existing pair fields', async () => {
    const { command, validateBuildAndRunLegacyWorkspaceMigration } =
      await buildCommand({ hasPairFields: true });

    await runCommand({ command });

    expect(validateBuildAndRunLegacyWorkspaceMigration).toHaveBeenCalledTimes(
      1,
    );
    expect(
      validateBuildAndRunLegacyWorkspaceMigration.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName.fieldMetadata.flatEntityToCreate,
    ).toEqual([]);
    expect(
      validateBuildAndRunLegacyWorkspaceMigration.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName.index.flatEntityToCreate,
    ).toHaveLength(1);
  });

  it.each([
    { hasPairFields: true, hasPairIndex: true },
    { hasChatHistory: false },
  ])(
    'does not migrate an already complete or unprovisioned workspace %p',
    async (state) => {
      const {
        command,
        findApplications,
        validateBuildAndRunLegacyWorkspaceMigration,
      } = await buildCommand(state);

      await runCommand({ command });

      expect(findApplications).not.toHaveBeenCalled();
      expect(
        validateBuildAndRunLegacyWorkspaceMigration,
      ).not.toHaveBeenCalled();
    },
  );

  it('preserves the workspace on a dry run', async () => {
    const {
      command,
      findApplications,
      validateBuildAndRunLegacyWorkspaceMigration,
    } = await buildCommand();

    await runCommand({ command, dryRun: true });

    expect(findApplications).not.toHaveBeenCalled();
    expect(validateBuildAndRunLegacyWorkspaceMigration).not.toHaveBeenCalled();
  });

  it('propagates migration failure', async () => {
    const { command } = await buildCommand({ migrationStatus: 'fail' });

    await expect(runCommand({ command })).rejects.toThrow(
      'Failed to add direct message pair identity',
    );
  });
});
