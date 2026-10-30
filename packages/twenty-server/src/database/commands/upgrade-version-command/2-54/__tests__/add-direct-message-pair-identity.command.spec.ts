import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { AddDirectMessagePairIdentityCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793366004507-add-direct-message-pair-identity.command';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

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

const buildCommand = ({
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
  const existing = structuredClone(
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: '2026-10-30T00:00:00.000Z',
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: APPLICATION_ID,
    }).allFlatEntityMaps,
  );

  if (!hasPairFields) {
    for (const fieldIdentifier of FIELD_IDENTIFIERS) {
      delete existing.flatFieldMetadataMaps.byUniversalIdentifier[
        fieldIdentifier
      ];
    }
  }

  if (!hasPairIndex) {
    delete existing.flatIndexMaps.byUniversalIdentifier[INDEX_IDENTIFIER];
  }

  if (!hasChatHistory) {
    delete existing.flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.agentChatThread.universalIdentifier
    ];
  }

  const validateBuildAndRunLegacyWorkspaceMigration = jest
    .fn()
    .mockResolvedValue({ status: migrationStatus });
  const command = new AddDirectMessagePairIdentityCommand(
    {} as WorkspaceIteratorService,
  );

  Object.assign(command, {
      applicationService: {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
          .fn()
          .mockResolvedValue({
            twentyStandardFlatApplication: {
              id: APPLICATION_ID,
              universalIdentifier: APPLICATION_ID,
            },
          }),
      },
      workspaceCacheService: {
        getOrRecompute: jest.fn().mockResolvedValue(existing),
      },
      workspaceMigrationValidateBuildAndRunService: {
        validateBuildAndRunLegacyWorkspaceMigration,
      },
  });

  return { command, validateBuildAndRunLegacyWorkspaceMigration };
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
      buildCommand();

    await runCommand({ command });

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
      buildCommand({ hasPairFields: true });

    await runCommand({ command });

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
  ])('does not migrate an already complete or unprovisioned workspace %p', async (state) => {
    const { command, validateBuildAndRunLegacyWorkspaceMigration } =
      buildCommand(state);

    await runCommand({ command });

    expect(validateBuildAndRunLegacyWorkspaceMigration).not.toHaveBeenCalled();
  });

  it('preserves the workspace on a dry run', async () => {
    const { command, validateBuildAndRunLegacyWorkspaceMigration } =
      buildCommand();

    await runCommand({ command, dryRun: true });

    expect(validateBuildAndRunLegacyWorkspaceMigration).not.toHaveBeenCalled();
  });

  it('propagates migration failure', async () => {
    const { command } = buildCommand({ migrationStatus: 'fail' });

    await expect(runCommand({ command })).rejects.toThrow(
      'Failed to add direct message pair identity',
    );
  });
});
