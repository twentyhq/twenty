import { Command } from 'nest-commander';
import {
  EVERYONE_PRINCIPAL_ID,
  PermissionFlagType,
} from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { buildAgentChatDefaultChannelId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-default-channel-id.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isPermissionFlagGrantedToFlatRole } from 'src/engine/metadata-modules/flat-role/utils/is-permission-flag-granted-to-flat-role.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type DefaultChannel = {
  kind: 'GENERAL' | 'SYSTEM';
  name: string;
  icon: string;
  visibility: 'PUBLIC' | 'PRIVATE';
};

const DEFAULT_CHANNELS: DefaultChannel[] = [
  { kind: 'GENERAL', name: 'General', icon: 'IconHash', visibility: 'PUBLIC' },
  {
    kind: 'SYSTEM',
    name: 'System',
    icon: 'IconRobot',
    visibility: 'PRIVATE',
  },
];

const getSeedTables = (workspaceId: string) => {
  const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

  return {
    channel: `${schema}."agentChatChannel"`,
    member: `${schema}."agentChatChannelMember"`,
    recordShare: `${schema}."recordShare"`,
    workspaceMember: `${schema}."workspaceMember"`,
  };
};

// A channel that already exists is left as its members made it. The members
// who manage the workspace own each one, as a creator owns their channel.
// Everyone reads a public channel through its general access, and each
// member reads a private one through the grant their membership carries
const seedDefaultChannel = async ({
  manager,
  workspaceId,
  channelObjectMetadataId,
  channel: { kind, name, icon, visibility },
  memberIds,
  ownerIds,
}: {
  manager: EntityManager;
  workspaceId: string;
  channelObjectMetadataId: string;
  channel: DefaultChannel;
  memberIds: string[];
  ownerIds: string[];
}): Promise<boolean> => {
  const tables = getSeedTables(workspaceId);
  const channelId = buildAgentChatDefaultChannelId({ workspaceId, kind });

  const created = await manager.query<{ id: string }[]>(
    `INSERT INTO ${tables.channel} (id, name, icon, visibility)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO NOTHING
     RETURNING id`,
    [channelId, name, icon, visibility],
  );

  if (created.length === 0) {
    return false;
  }

  await manager.query(
    `INSERT INTO ${tables.recordShare}
       ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
     SELECT $1::uuid, $2::uuid, owner_id, 'WORKSPACE_MEMBER', 'FULL', 'OWNER', $2::uuid
     FROM unnest($3::uuid[]) AS owner_id
     ON CONFLICT DO NOTHING`,
    [channelObjectMetadataId, channelId, ownerIds],
  );

  if (visibility === 'PUBLIC') {
    await manager.query(
      `INSERT INTO ${tables.recordShare}
         ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
       VALUES ($1, $2, $3, 'EVERYONE', 'READ_WRITE', 'RULE', $2)
       ON CONFLICT DO NOTHING`,
      [channelObjectMetadataId, channelId, EVERYONE_PRINCIPAL_ID],
    );
  }

  await manager.query(
    `WITH inserted_member AS (
       INSERT INTO ${tables.member} ("channelId", "workspaceMemberId", position)
       SELECT $1, member.id, (
         SELECT COALESCE(MAX(existing.position), 0) + 1
         FROM ${tables.member} existing
         WHERE existing."workspaceMemberId" = member.id
       )
       FROM ${tables.workspaceMember} member
       WHERE member.id = ANY($2::uuid[]) AND member."deletedAt" IS NULL
       ON CONFLICT ("channelId", "workspaceMemberId") DO NOTHING
       RETURNING id, "channelId", "workspaceMemberId"
     )
     INSERT INTO ${tables.recordShare}
       ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
     SELECT $3::uuid, inserted_member."channelId", inserted_member."workspaceMemberId", 'WORKSPACE_MEMBER', 'READ_WRITE', 'RULE', inserted_member.id
     FROM inserted_member
     ON CONFLICT DO NOTHING`,
    [channelId, memberIds, channelObjectMetadataId],
  );

  return true;
};

// Chats in a default channel stay, and leave the channel with it
const deleteDefaultChannels = async ({
  manager,
  workspaceId,
}: {
  manager: EntityManager;
  workspaceId: string;
}): Promise<number> => {
  const tables = getSeedTables(workspaceId);
  const channelIds = DEFAULT_CHANNELS.map(({ kind }) =>
    buildAgentChatDefaultChannelId({ workspaceId, kind }),
  );

  await manager.query(
    `DELETE FROM ${tables.recordShare} WHERE "recordId" = ANY($1::uuid[])`,
    [channelIds],
  );
  await manager.query(
    `DELETE FROM ${tables.member} WHERE "channelId" = ANY($1::uuid[])`,
    [channelIds],
  );

  const [, deletedCount]: [unknown[], number] = await manager.query(
    `DELETE FROM ${tables.channel} WHERE id = ANY($1::uuid[])`,
    [channelIds],
  );

  return deletedCount;
};

@RegisteredWorkspaceCommand('2.46.0', 1791387425039)
@Command({
  name: 'upgrade:2-46:seed-default-agent-chat-channels',
  description:
    'Create the General chat channel for every member with AI access and the private System channel for the members who manage the workspace',
})
export class SeedDefaultAgentChatChannelsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly storage: AgentHistoryUpgradeStorageService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const channelObjectMetadataId =
      await this.findChannelObjectMetadataIdIfProvisioned(workspaceId);

    if (!isDefined(channelObjectMetadataId)) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would seed the default chat channels for workspace ${workspaceId}`,
      );

      return;
    }

    const memberIdsByKind = await this.findDefaultMemberIds(workspaceId);

    const createdCount = await this.storage.run(
      workspaceId,
      async ({ manager }) => {
        let count = 0;

        for (const channel of DEFAULT_CHANNELS) {
          const isCreated = await seedDefaultChannel({
            manager,
            workspaceId,
            channelObjectMetadataId,
            channel,
            memberIds: memberIdsByKind[channel.kind],
            ownerIds: memberIdsByKind.SYSTEM,
          });

          count += isCreated ? 1 : 0;
        }

        return count;
      },
    );

    this.logger.log(
      `Workspace ${workspaceId}: created ${createdCount} default chat channel(s)`,
    );
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const channelObjectMetadataId =
      await this.findChannelObjectMetadataIdIfProvisioned(workspaceId);

    if (!isDefined(channelObjectMetadataId)) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would delete the default chat channels for workspace ${workspaceId}`,
      );

      return;
    }

    const deletedCount = await this.storage.run(workspaceId, ({ manager }) =>
      deleteDefaultChannels({ manager, workspaceId }),
    );

    this.logger.log(
      `Workspace ${workspaceId}: deleted ${deletedCount} default chat channel(s)`,
    );
  }

  private async findChannelObjectMetadataIdIfProvisioned(
    workspaceId: string,
  ): Promise<string | undefined> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const channelObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatChannel.universalIdentifier
      ];

    if (!isDefined(channelObject)) {
      this.logger.log(
        `Chat channel object not found for workspace ${workspaceId}, skipping`,
      );

      return undefined;
    }

    return channelObject.id;
  }

  // Everyone with AI access joins General; the members whose role manages
  // every setting also join System
  private async findDefaultMemberIds(
    workspaceId: string,
  ): Promise<Record<DefaultChannel['kind'], string[]>> {
    const {
      flatWorkspaceMemberMaps,
      userWorkspaceRoleMap,
      flatRoleMaps,
      flatRolePermissionFlagMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatWorkspaceMemberMaps',
      'userWorkspaceRoleMap',
      'flatRoleMaps',
      'flatRolePermissionFlagMaps',
    ]);

    const memberIdsByKind: Record<DefaultChannel['kind'], string[]> = {
      GENERAL: [],
      SYSTEM: [],
    };

    for (const member of Object.values(flatWorkspaceMemberMaps.byId)) {
      if (!isDefined(member) || isDefined(member.deletedAt)) {
        continue;
      }

      const userWorkspaceId =
        flatWorkspaceMemberMaps.userWorkspaceIdByUserId[member.userId];
      const roleId = isDefined(userWorkspaceId)
        ? userWorkspaceRoleMap[userWorkspaceId]
        : undefined;
      const flatRole = isDefined(roleId)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: roleId,
            flatEntityMaps: flatRoleMaps,
          })
        : undefined;

      if (
        !isDefined(flatRole) ||
        !isPermissionFlagGrantedToFlatRole({
          flatRole,
          permissionFlag: PermissionFlagType.AI,
          flatRolePermissionFlagMaps,
        })
      ) {
        continue;
      }

      memberIdsByKind.GENERAL.push(member.id);

      if (flatRole.canUpdateAllSettings) {
        memberIdsByKind.SYSTEM.push(member.id);
      }
    }

    return memberIdsByKind;
  }
}
