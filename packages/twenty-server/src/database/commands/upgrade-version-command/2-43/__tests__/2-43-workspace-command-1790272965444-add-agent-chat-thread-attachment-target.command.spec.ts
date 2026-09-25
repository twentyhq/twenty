import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { AddAgentChatThreadAttachmentTargetCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790272965444-add-agent-chat-thread-attachment-target.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const APPLICATION_ID = '20202020-2222-4222-8222-222222222222';

const TARGET_FIELD_IDENTIFIER =
  STANDARD_OBJECTS.attachment.fields.targetAgentChatThread.universalIdentifier;
const INVERSE_FIELD_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThread.fields.attachments.universalIdentifier;
const INDEX_IDENTIFIER =
  STANDARD_OBJECTS.attachment.indexes.agentChatThreadIdIndex
    .universalIdentifier;

const buildExistingMetadata = ({
  hasAttachmentTarget,
  hasAgentChatThread = true,
}: {
  hasAttachmentTarget: boolean;
  hasAgentChatThread?: boolean;
}) => {
  const existing = structuredClone(
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: '2026-01-01T00:00:00Z',
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: APPLICATION_ID,
    }).allFlatEntityMaps,
  );

  if (!hasAttachmentTarget) {
    delete existing.flatFieldMetadataMaps.byUniversalIdentifier[
      TARGET_FIELD_IDENTIFIER
    ];
    delete existing.flatFieldMetadataMaps.byUniversalIdentifier[
      INVERSE_FIELD_IDENTIFIER
    ];
    delete existing.flatIndexMaps.byUniversalIdentifier[INDEX_IDENTIFIER];
  }

  if (!hasAgentChatThread) {
    delete existing.flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.agentChatThread.universalIdentifier
    ];
  }

  return existing;
};

const buildCommand = ({
  hasAttachmentTarget = false,
  hasAgentChatThread = true,
  migrationStatus = 'success',
}: {
  hasAttachmentTarget?: boolean;
  hasAgentChatThread?: boolean;
  migrationStatus?: 'success' | 'fail';
} = {}) => {
  const validateBuildAndRunLegacyWorkspaceMigration = jest
    .fn()
    .mockResolvedValue({ status: migrationStatus });
  const command = new AddAgentChatThreadAttachmentTargetCommand(
    {} as WorkspaceIteratorService,
    {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
        .fn()
        .mockResolvedValue({
          twentyStandardFlatApplication: {
            id: APPLICATION_ID,
            universalIdentifier: APPLICATION_ID,
          },
        }),
    } as unknown as ApplicationService,
    {
      getOrRecompute: jest
        .fn()
        .mockResolvedValue(
          buildExistingMetadata({ hasAttachmentTarget, hasAgentChatThread }),
        ),
    } as unknown as WorkspaceCacheService,
    {
      validateBuildAndRunLegacyWorkspaceMigration,
    } as unknown as WorkspaceMigrationValidateBuildAndRunService,
  );

  return { command, validateBuildAndRunLegacyWorkspaceMigration };
};

const run = (
  command: AddAgentChatThreadAttachmentTargetCommand,
  options: { dryRun?: boolean } = {},
) =>
  command.runOnWorkspace({
    workspaceId: WORKSPACE_ID,
    options,
    index: 0,
    total: 1,
  });

describe('AddAgentChatThreadAttachmentTargetCommand', () => {
  it('creates both relation sides and the attachment index', async () => {
    const { command, validateBuildAndRunLegacyWorkspaceMigration } =
      buildCommand();

    await run(command);

    const [{ allFlatEntityOperationByMetadataName }] =
      validateBuildAndRunLegacyWorkspaceMigration.mock.calls[0];

    expect(
      allFlatEntityOperationByMetadataName.fieldMetadata.flatEntityToCreate
        .map(
          ({ universalIdentifier }: { universalIdentifier: string }) =>
            universalIdentifier,
        )
        .sort(),
    ).toEqual([TARGET_FIELD_IDENTIFIER, INVERSE_FIELD_IDENTIFIER].sort());
    expect(
      allFlatEntityOperationByMetadataName.index.flatEntityToCreate.map(
        ({ universalIdentifier }: { universalIdentifier: string }) =>
          universalIdentifier,
      ),
    ).toEqual([INDEX_IDENTIFIER]);
  });

  it('does nothing when the target already exists', async () => {
    const { command, validateBuildAndRunLegacyWorkspaceMigration } =
      buildCommand({ hasAttachmentTarget: true });

    await run(command);

    expect(validateBuildAndRunLegacyWorkspaceMigration).not.toHaveBeenCalled();
  });

  it('skips workspaces whose chat history is not provisioned yet', async () => {
    const { command, validateBuildAndRunLegacyWorkspaceMigration } =
      buildCommand({ hasAgentChatThread: false });

    await run(command);

    expect(validateBuildAndRunLegacyWorkspaceMigration).not.toHaveBeenCalled();
  });

  it('does not migrate on a dry run', async () => {
    const { command, validateBuildAndRunLegacyWorkspaceMigration } =
      buildCommand();

    await run(command, { dryRun: true });

    expect(validateBuildAndRunLegacyWorkspaceMigration).not.toHaveBeenCalled();
  });

  it('throws when the migration fails', async () => {
    const { command } = buildCommand({ migrationStatus: 'fail' });

    await expect(run(command)).rejects.toThrow(
      'Failed to create the agent chat thread attachment target',
    );
  });
});
