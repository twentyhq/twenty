import { preserveLegacyRecordAccess } from 'src/database/commands/upgrade-version-command/2-43/utils/preserve-legacy-record-access.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FeatureFlagKey,
  MetadataReadability,
  MetadataWritability,
} from 'twenty-shared/types';

import { ServiceUnavailableException } from '@nestjs/common';

import { EnableCommonRecordSharingCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790312694997-enable-common-record-sharing.command';
import { isEmptyUnprovisionedAgentHistoryWorkspace } from 'src/database/commands/upgrade-version-command/2-43/utils/is-empty-unprovisioned-agent-history-workspace.util';
import { backfillChatThreadOwnerGrants } from 'src/engine/metadata-modules/ai/ai-chat/utils/backfill-chat-thread-owner-grants.util';

jest.mock(
  'src/engine/metadata-modules/ai/ai-chat/utils/backfill-chat-thread-owner-grants.util',
);

jest.mock(
  'src/database/commands/upgrade-version-command/2-43/utils/preserve-legacy-record-access.util',
);

jest.mock(
  'src/database/commands/upgrade-version-command/2-43/utils/is-empty-unprovisioned-agent-history-workspace.util',
);

const args = {
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  options: { dryRun: false },
} as never;
const buildCommand = () => {
  const maps = {
    featureFlagsMap: {},
    flatObjectMetadataMaps: {
      byUniversalIdentifier: {
        [STANDARD_OBJECTS.agentChatThread.universalIdentifier]: {
          id: 'thread',
        },
      },
    },
    flatFieldMetadataMaps: {
      byUniversalIdentifier: {
        [STANDARD_OBJECTS.agentChatThread.fields.title.universalIdentifier]: {
          id: 'title',
        },
      },
    },
  };
  const context = {
    manager: { query: jest.fn().mockResolvedValue([]) },
    table: () => 'workspace.thread',
  };
  const storage = {
    run: jest
      .fn()
      .mockImplementation(async (_workspaceId, work) => work(context)),
  };
  const migrations = {
    validateBuildAndRunLegacyWorkspaceMigration: jest
      .fn()
      .mockResolvedValue({ status: 'success' }),
  };
  const billing = {
    getWorkspaceEntitlementValue: jest.fn().mockResolvedValue(false),
  };
  const command = new EnableCommonRecordSharingCommand(
    {} as never,
    {
      getOrRecompute: jest.fn().mockResolvedValue(maps),
      invalidateAndRecompute: jest.fn(),
    } as never,
    storage as never,
    migrations as never,
    billing as never,
    { manager: context.manager } as never,
  );
  return { command, storage, migrations, context, maps, billing };
};

describe('Common sharing upgrade', () => {
  beforeEach(() => jest.resetAllMocks());

  it.each([
    [undefined, false, false],
    [undefined, true, false],
    [false, false, false],
    [false, true, false],
    [true, false, false],
    [true, true, true],
  ])(
    'preserves historical access for flag=%s entitlement=%s',
    async (flag, entitlement, wasRecordSharingEnabled) => {
      const { command, maps, billing } = buildCommand();
      Object.assign(maps.featureFlagsMap, {
        [FeatureFlagKey.IS_RECORD_SHARING_ENABLED]: flag,
      });
      billing.getWorkspaceEntitlementValue.mockResolvedValue(entitlement);
      await command.up(args);
      expect(preserveLegacyRecordAccess).toHaveBeenCalledWith(
        expect.objectContaining({ wasRecordSharingEnabled }),
      );
      expect(billing.getWorkspaceEntitlementValue).toHaveBeenCalledTimes(
        flag === true ? 1 : 0,
      );
    },
  );

  it.each([true, false])(
    'only skips missing metadata when storage is unprovisioned and empty (%s)',
    async (isEmpty) => {
      const { command, maps, migrations } = buildCommand();
      Object.assign(maps.flatObjectMetadataMaps, { byUniversalIdentifier: {} });
      jest
        .mocked(isEmptyUnprovisionedAgentHistoryWorkspace)
        .mockResolvedValue(isEmpty);
      const result = command.up(args);
      if (isEmpty) await expect(result).resolves.toBeUndefined();
      else
        await expect(result).rejects.toThrow(
          'Conversation metadata must be provisioned',
        );
      expect(
        migrations.validateBuildAndRunLegacyWorkspaceMigration,
      ).not.toHaveBeenCalled();
    },
  );

  it('backfills owner access before enabling private record permissions', async () => {
    const { command, migrations } = buildCommand();
    migrations.validateBuildAndRunLegacyWorkspaceMigration.mockImplementation(
      async (migration) => {
        expect(backfillChatThreadOwnerGrants).toHaveBeenCalledTimes(1);
        expect(
          migration.allFlatEntityOperationByMetadataName.objectMetadata
            .flatEntityToUpdate,
        ).toEqual([
          {
            id: 'thread',
            readability: MetadataReadability.PRIVATE,
            writability: MetadataWritability.OPEN,
          },
        ]);
        expect(
          migration.allFlatEntityOperationByMetadataName.fieldMetadata
            .flatEntityToUpdate,
        ).toEqual([{ id: 'title', writability: MetadataWritability.OPEN }]);
        return { status: 'success' };
      },
    );
    await command.up(args);
  });

  it('does not change metadata when ownership backfill fails', async () => {
    const { command, migrations } = buildCommand();
    jest
      .mocked(backfillChatThreadOwnerGrants)
      .mockRejectedValue(new Error('Storage unavailable'));
    await expect(command.up(args)).rejects.toThrow('Storage unavailable');
    expect(
      migrations.validateBuildAndRunLegacyWorkspaceMigration,
    ).not.toHaveBeenCalled();
  });

  it('requires history to have moved to workspace storage first', async () => {
    const { command, storage, migrations } = buildCommand();
    storage.run.mockRejectedValue(
      new ServiceUnavailableException(
        'AI history is unavailable until this workspace finishes upgrading.',
      ),
    );
    await expect(command.up(args)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(preserveLegacyRecordAccess).toHaveBeenCalled();
    expect(backfillChatThreadOwnerGrants).not.toHaveBeenCalled();
    expect(
      migrations.validateBuildAndRunLegacyWorkspaceMigration,
    ).not.toHaveBeenCalled();
  });

  it('reports a metadata migration failure instead of advancing the upgrade cursor', async () => {
    const { command, migrations } = buildCommand();
    migrations.validateBuildAndRunLegacyWorkspaceMigration.mockResolvedValue({
      status: 'fail',
    });
    await expect(command.up(args)).rejects.toThrow(
      'Could not migrate conversation permissions',
    );
  });

  it('supports dry runs without changing grants or metadata', async () => {
    const { command, storage, migrations } = buildCommand();
    await command.up({
      workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
      options: { dryRun: true },
    } as never);
    expect(storage.run).not.toHaveBeenCalled();
    expect(
      migrations.validateBuildAndRunLegacyWorkspaceMigration,
    ).not.toHaveBeenCalled();
  });

  it('retains activated privacy metadata on application rollback', async () => {
    const { command, storage, migrations } = buildCommand();
    await command.down(args);
    expect(storage.run).not.toHaveBeenCalled();
    expect(
      migrations.validateBuildAndRunLegacyWorkspaceMigration,
    ).not.toHaveBeenCalled();
  });
});
