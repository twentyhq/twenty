import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import {
  isDefined,
  isNonEmptyArray,
  removeUndefinedFields,
} from 'twenty-shared/utils';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { addRoleIdsToFlatAgentChatChannel } from 'src/engine/metadata-modules/agent-chat-channel/utils/add-role-ids-to-flat-agent-chat-channel.util';
import { assertAgentChatChannelOwnedByApplicationOrThrow } from 'src/engine/metadata-modules/agent-chat-channel/utils/assert-agent-chat-channel-owned-by-application-or-throw.util';
import { buildAgentChatChannelRolesToCreate } from 'src/engine/metadata-modules/agent-chat-channel/utils/build-agent-chat-channel-roles-to-create.util';
import { findAgentChatChannelRoleUniversalIdentifiersOrThrow } from 'src/engine/metadata-modules/agent-chat-channel/utils/find-agent-chat-channel-role-universal-identifiers-or-throw.util';
import { findFlatAgentChatChannelOrThrow } from 'src/engine/metadata-modules/agent-chat-channel/utils/find-flat-agent-chat-channel-or-throw.util';
import { validateAgentChatChannelNameOrThrow } from 'src/engine/metadata-modules/agent-chat-channel/utils/validate-agent-chat-channel-name-or-throw.util';
import { type FlatAgentChatChannelWithRoleIds } from 'src/engine/metadata-modules/agent-chat-channel/types/flat-agent-chat-channel-with-role-ids.type';
import { acquireAgentChatChannelGrantLocks } from 'src/engine/metadata-modules/ai/ai-chat/utils/acquire-agent-chat-channel-grant-locks.util';
import { replaceAgentChatChannelRuleGrants } from 'src/engine/metadata-modules/ai/ai-chat/utils/replace-agent-chat-channel-rule-grants.util';
import { type FlatAgentChatChannelRole } from 'src/engine/metadata-modules/flat-agent-chat-channel-role/types/flat-agent-chat-channel-role.type';
import { type FlatAgentChatChannel } from 'src/engine/metadata-modules/flat-agent-chat-channel/types/flat-agent-chat-channel.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityToCreateDeleteUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

type ChannelChanges = Partial<
  Pick<FlatAgentChatChannel, 'name' | 'icon' | 'color' | 'position'>
>;

type ChannelToCreate = {
  name: string;
  icon: string | null;
  color: string | null;
  roleIds: string[];
};

type ChannelMaps = Pick<
  AllFlatEntityMaps,
  'flatAgentChatChannelMaps' | 'flatAgentChatChannelRoleMaps' | 'flatRoleMaps'
>;

@Injectable()
export class AgentChatChannelMetadataService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly applicationService: ApplicationService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {}

  async findChannels(
    workspaceId: string,
  ): Promise<FlatAgentChatChannelWithRoleIds[]> {
    const { flatAgentChatChannelMaps, flatAgentChatChannelRoleMaps } =
      await this.getChannelMaps(workspaceId);

    return Object.values(flatAgentChatChannelMaps.byUniversalIdentifier)
      .filter(isDefined)
      .map((channel) =>
        addRoleIdsToFlatAgentChatChannel({
          channel,
          flatAgentChatChannelRoleMaps,
        }),
      )
      .sort(
        (left, right) =>
          left.position - right.position ||
          left.name.localeCompare(right.name) ||
          left.id.localeCompare(right.id),
      );
  }

  async findChannelOrThrow({
    workspaceId,
    channelId,
  }: {
    workspaceId: string;
    channelId: string;
  }): Promise<FlatAgentChatChannelWithRoleIds> {
    const { flatAgentChatChannelMaps, flatAgentChatChannelRoleMaps } =
      await this.getChannelMaps(workspaceId);

    return addRoleIdsToFlatAgentChatChannel({
      channel: findFlatAgentChatChannelOrThrow({
        flatAgentChatChannelMaps,
        channelId,
      }),
      flatAgentChatChannelRoleMaps,
    });
  }

  async createChannel({
    workspaceId,
    callingApplication,
    universalIdentifier,
    ...channelToCreate
  }: ChannelToCreate & {
    workspaceId: string;
    callingApplication: FlatApplication | undefined;
    universalIdentifier: string | undefined;
  }): Promise<FlatAgentChatChannelWithRoleIds> {
    const ownerFlatApplication =
      callingApplication ??
      (await this.findWorkspaceCustomFlatApplication(workspaceId));
    const channelUniversalIdentifier =
      universalIdentifier?.toLowerCase() ?? v4();

    const existingChannel = await this.findChannelByUniversalIdentifier({
      workspaceId,
      universalIdentifier: channelUniversalIdentifier,
    });

    if (isDefined(existingChannel)) {
      assertAgentChatChannelOwnedByApplicationOrThrow({
        channel: existingChannel,
        applicationId: ownerFlatApplication.id,
      });

      return existingChannel;
    }

    try {
      return await this.insertChannel({
        workspaceId,
        ownerFlatApplication,
        universalIdentifier: channelUniversalIdentifier,
        ...channelToCreate,
      });
    } catch (error) {
      const concurrentlyCreatedChannel =
        await this.findChannelByUniversalIdentifier({
          workspaceId,
          universalIdentifier: channelUniversalIdentifier,
        });

      if (!isDefined(concurrentlyCreatedChannel)) {
        throw error;
      }

      assertAgentChatChannelOwnedByApplicationOrThrow({
        channel: concurrentlyCreatedChannel,
        applicationId: ownerFlatApplication.id,
      });

      return concurrentlyCreatedChannel;
    }
  }

  // Name, icon, color, position and access stay the workspace's own on a
  // channel an application ships, so they are edited the same way
  async updateChannel({
    workspaceId,
    callingApplication,
    channelId,
    changes,
    roleIds,
  }: {
    workspaceId: string;
    callingApplication: FlatApplication | undefined;
    channelId: string;
    changes: ChannelChanges;
    roleIds?: string[];
  }): Promise<FlatAgentChatChannelWithRoleIds> {
    const channelMaps = await this.getChannelMaps(workspaceId);
    const channel = findFlatAgentChatChannelOrThrow({
      flatAgentChatChannelMaps: channelMaps.flatAgentChatChannelMaps,
      channelId,
    });
    const ownerFlatApplication =
      await this.findChannelChangesOwnerFlatApplication({
        workspaceId,
        channel,
        callingApplication,
      });
    const now = new Date().toISOString();

    const definedChanges = removeUndefinedFields({
      ...changes,
      ...(isDefined(changes.name)
        ? { name: validateAgentChatChannelNameOrThrow(changes.name) }
        : {}),
    });

    const currentChannelRoles = findManyFlatEntityByIdInFlatEntityMaps({
      flatEntityIds: channel.channelRoleIds,
      flatEntityMaps: channelMaps.flatAgentChatChannelRoleMaps,
    });

    const requestedRoleUniversalIdentifiers = isDefined(roleIds)
      ? findAgentChatChannelRoleUniversalIdentifiersOrThrow({
          flatRoleMaps: channelMaps.flatRoleMaps,
          roleIds,
        })
      : undefined;

    const channelRolesToDelete = isDefined(requestedRoleUniversalIdentifiers)
      ? currentChannelRoles.filter(
          ({ roleUniversalIdentifier }) =>
            !requestedRoleUniversalIdentifiers.includes(
              roleUniversalIdentifier,
            ),
        )
      : [];

    const channelRolesToCreate = buildAgentChatChannelRolesToCreate({
      channelUniversalIdentifier: channel.universalIdentifier,
      roleUniversalIdentifiers: (
        requestedRoleUniversalIdentifiers ?? []
      ).filter(
        (roleUniversalIdentifier) =>
          !currentChannelRoles.some(
            (channelRole) =>
              channelRole.roleUniversalIdentifier === roleUniversalIdentifier,
          ),
      ),
      applicationUniversalIdentifier: ownerFlatApplication.universalIdentifier,
      now,
    });

    const isChannelChanged = Object.keys(definedChanges).length > 0;

    if (
      !isChannelChanged &&
      channelRolesToCreate.length === 0 &&
      channelRolesToDelete.length === 0
    ) {
      return addRoleIdsToFlatAgentChatChannel({
        channel,
        flatAgentChatChannelRoleMaps: channelMaps.flatAgentChatChannelRoleMaps,
      });
    }

    await this.runMigration({
      workspaceId,
      applicationUniversalIdentifier: ownerFlatApplication.universalIdentifier,
      channelsToUpdate: isChannelChanged
        ? [{ ...channel, ...definedChanges, updatedAt: now }]
        : [],
      channelRolesToCreate,
      channelRolesToDelete,
    });

    return this.findChannelOrThrow({ workspaceId, channelId });
  }

  async deleteChannel({
    workspaceId,
    callingApplication,
    channelId,
  }: {
    workspaceId: string;
    callingApplication: FlatApplication | undefined;
    channelId: string;
  }): Promise<FlatAgentChatChannelWithRoleIds> {
    const { flatAgentChatChannelMaps, flatAgentChatChannelRoleMaps } =
      await this.getChannelMaps(workspaceId);
    const { flatNavigationMenuItemMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatNavigationMenuItemMaps'] },
      );
    const channel = findFlatAgentChatChannelOrThrow({
      flatAgentChatChannelMaps,
      channelId,
    });
    const ownerFlatApplication =
      await this.findChannelChangesOwnerFlatApplication({
        workspaceId,
        channel,
        callingApplication,
      });

    await this.runMigration({
      workspaceId,
      applicationUniversalIdentifier: ownerFlatApplication.universalIdentifier,
      channelsToDelete: [channel],
      channelRolesToDelete: findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: channel.channelRoleIds,
        flatEntityMaps: flatAgentChatChannelRoleMaps,
      }),
      navigationMenuItemsToDelete: findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: channel.navigationMenuItemIds,
        flatEntityMaps: flatNavigationMenuItemMaps,
      }),
    });

    return addRoleIdsToFlatAgentChatChannel({
      channel,
      flatAgentChatChannelRoleMaps,
    });
  }

  // Migrations cannot change an entity's application, hence the direct writes
  async transferApplicationChannelsToWorkspace({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }): Promise<void> {
    const workspaceCustomFlatApplication =
      await this.findWorkspaceCustomFlatApplication(workspaceId);

    const transferredChannelIds = await this.coreDataSource.transaction(
      async (manager) => {
        const transferredChannels = await manager.query<{ id: string }[]>(
          `WITH transferred_channel AS (
             UPDATE core."agentChatChannel"
             SET "applicationId" = $3, "updatedAt" = now()
             WHERE "workspaceId" = $1 AND "applicationId" = $2
             RETURNING id
           )
           SELECT id FROM transferred_channel`,
          [workspaceId, applicationId, workspaceCustomFlatApplication.id],
        );
        const channelIds = transferredChannels.map(({ id }) => id);

        if (!isNonEmptyArray(channelIds)) {
          return channelIds;
        }

        await acquireAgentChatChannelGrantLocks({
          manager,
          workspaceId,
          channelIds,
          mode: 'exclusive',
        });

        await manager.query(
          `DELETE FROM core."agentChatChannelRole" channel_role
           USING core."role" application_role
           WHERE channel_role."workspaceId" = $1
             AND channel_role."channelId" = ANY($2::uuid[])
             AND application_role.id = channel_role."roleId"
             AND application_role."applicationId" = $3`,
          [workspaceId, channelIds, applicationId],
        );

        await manager.query(
          `UPDATE core."agentChatChannelRole"
           SET "applicationId" = $4, "updatedAt" = now()
           WHERE "workspaceId" = $1
             AND "channelId" = ANY($2::uuid[])
             AND "applicationId" = $3`,
          [
            workspaceId,
            channelIds,
            applicationId,
            workspaceCustomFlatApplication.id,
          ],
        );

        await replaceAgentChatChannelRuleGrants({
          manager,
          workspaceId,
          scope: { channelIds },
        });

        return channelIds;
      },
    );

    if (!isNonEmptyArray(transferredChannelIds)) {
      return;
    }

    await this.flatEntityMapsCacheService.invalidateFlatEntityMaps({
      workspaceId,
      flatMapsKeys: [
        'flatAgentChatChannelMaps',
        'flatAgentChatChannelRoleMaps',
        'flatRoleMaps',
      ],
    });
  }

  private async insertChannel({
    workspaceId,
    ownerFlatApplication,
    universalIdentifier,
    name,
    icon,
    color,
    roleIds,
  }: ChannelToCreate & {
    workspaceId: string;
    ownerFlatApplication: Pick<FlatApplication, 'universalIdentifier'>;
    universalIdentifier: string;
  }): Promise<FlatAgentChatChannelWithRoleIds> {
    const channelMaps = await this.getChannelMaps(workspaceId);
    const now = new Date().toISOString();
    const channelId = v4();

    const lastPosition = Math.max(
      -1,
      ...Object.values(
        channelMaps.flatAgentChatChannelMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .map(({ position }) => position),
    );

    await this.runMigration({
      workspaceId,
      applicationUniversalIdentifier: ownerFlatApplication.universalIdentifier,
      channelsToCreate: [
        {
          id: channelId,
          universalIdentifier,
          name: validateAgentChatChannelNameOrThrow(name),
          icon,
          color,
          position: lastPosition + 1,
          channelRoleUniversalIdentifiers: [],
          navigationMenuItemUniversalIdentifiers: [],
          applicationUniversalIdentifier:
            ownerFlatApplication.universalIdentifier,
          createdAt: now,
          updatedAt: now,
        },
      ],
      channelRolesToCreate: buildAgentChatChannelRolesToCreate({
        channelUniversalIdentifier: universalIdentifier,
        roleUniversalIdentifiers:
          findAgentChatChannelRoleUniversalIdentifiersOrThrow({
            flatRoleMaps: channelMaps.flatRoleMaps,
            roleIds,
          }),
        applicationUniversalIdentifier:
          ownerFlatApplication.universalIdentifier,
        now,
      }),
    });

    return this.findChannelOrThrow({ workspaceId, channelId });
  }

  private async findChannelByUniversalIdentifier({
    workspaceId,
    universalIdentifier,
  }: {
    workspaceId: string;
    universalIdentifier: string;
  }): Promise<FlatAgentChatChannelWithRoleIds | undefined> {
    const { flatAgentChatChannelMaps, flatAgentChatChannelRoleMaps } =
      await this.getChannelMaps(workspaceId);
    const channel = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatAgentChatChannelMaps,
      universalIdentifier,
    });

    if (!isDefined(channel)) {
      return undefined;
    }

    return addRoleIdsToFlatAgentChatChannel({
      channel,
      flatAgentChatChannelRoleMaps,
    });
  }

  private async findChannelChangesOwnerFlatApplication({
    workspaceId,
    channel,
    callingApplication,
  }: {
    workspaceId: string;
    channel: Pick<FlatAgentChatChannel, 'applicationId'>;
    callingApplication: FlatApplication | undefined;
  }): Promise<FlatApplication> {
    const isChannelOwnedByCallingApplication =
      isDefined(callingApplication) &&
      channel.applicationId === callingApplication.id;

    if (isChannelOwnedByCallingApplication) {
      return callingApplication;
    }

    return this.findWorkspaceCustomFlatApplication(workspaceId);
  }

  private async findWorkspaceCustomFlatApplication(
    workspaceId: string,
  ): Promise<FlatApplication> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    return workspaceCustomFlatApplication;
  }

  private async getChannelMaps(workspaceId: string): Promise<ChannelMaps> {
    return this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatAgentChatChannelMaps',
          'flatAgentChatChannelRoleMaps',
          'flatRoleMaps',
        ],
      },
    );
  }

  private async runMigration({
    workspaceId,
    applicationUniversalIdentifier,
    channelsToCreate = [],
    channelsToUpdate = [],
    channelsToDelete = [],
    channelRolesToCreate = [],
    channelRolesToDelete = [],
    navigationMenuItemsToDelete = [],
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    channelsToCreate?: FlatEntityToCreateDeleteUpdate<'agentChatChannel'>['flatEntityToCreate'];
    channelsToUpdate?: FlatAgentChatChannel[];
    channelsToDelete?: FlatAgentChatChannel[];
    channelRolesToCreate?: FlatEntityToCreateDeleteUpdate<'agentChatChannelRole'>['flatEntityToCreate'];
    channelRolesToDelete?: FlatAgentChatChannelRole[];
    navigationMenuItemsToDelete?: FlatNavigationMenuItem[];
  }): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            agentChatChannel: {
              flatEntityToCreate: channelsToCreate,
              flatEntityToUpdate: channelsToUpdate,
              flatEntityToDelete: channelsToDelete,
            },
            agentChatChannelRole: {
              flatEntityToCreate: channelRolesToCreate,
              flatEntityToUpdate: [],
              flatEntityToDelete: channelRolesToDelete,
            },
            navigationMenuItem: {
              flatEntityToCreate: [],
              flatEntityToUpdate: [],
              flatEntityToDelete: navigationMenuItemsToDelete,
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier,
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        'Multiple validation errors occurred while saving the channel',
      );
    }
  }
}
