import { Injectable } from '@nestjs/common';

import { isDefined, removeUndefinedFields } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getScopedCallingApplication } from 'src/engine/core-modules/application/utils/get-scoped-calling-application.util';
import { addRoleIdsToFlatAgentChatChannel } from 'src/engine/metadata-modules/agent-chat-channel/utils/add-role-ids-to-flat-agent-chat-channel.util';
import { assertAgentChatChannelNameNotTakenOrThrow } from 'src/engine/metadata-modules/agent-chat-channel/utils/assert-agent-chat-channel-name-not-taken-or-throw.util';
import { assertAgentChatChannelUniversalIdentifierNotTakenOrThrow } from 'src/engine/metadata-modules/agent-chat-channel/utils/assert-agent-chat-channel-universal-identifier-not-taken-or-throw.util';
import { buildAgentChatChannelRolesToCreate } from 'src/engine/metadata-modules/agent-chat-channel/utils/build-agent-chat-channel-roles-to-create.util';
import { findAgentChatChannelRoleUniversalIdentifiersOrThrow } from 'src/engine/metadata-modules/agent-chat-channel/utils/find-agent-chat-channel-role-universal-identifiers-or-throw.util';
import { findFlatAgentChatChannelOrThrow } from 'src/engine/metadata-modules/agent-chat-channel/utils/find-flat-agent-chat-channel-or-throw.util';
import { getAvailableAgentChatChannelName } from 'src/engine/metadata-modules/agent-chat-channel/utils/get-available-agent-chat-channel-name.util';
import { validateAgentChatChannelNameOrThrow } from 'src/engine/metadata-modules/agent-chat-channel/utils/validate-agent-chat-channel-name-or-throw.util';
import { validateAgentChatChannelUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/agent-chat-channel/utils/validate-agent-chat-channel-universal-identifier-or-throw.util';
import { type FlatAgentChatChannelWithRoleIds } from 'src/engine/metadata-modules/agent-chat-channel/types/flat-agent-chat-channel-with-role-ids.type';
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

type ChannelToInsert = ChannelToCreate & {
  workspaceId: string;
  applicationUniversalIdentifier: string;
  universalIdentifier: string;
  shouldPickAvailableName: boolean;
};

type ChannelMaps = Pick<
  AllFlatEntityMaps,
  'flatAgentChatChannelMaps' | 'flatAgentChatChannelRoleMaps' | 'flatRoleMaps'
>;

@Injectable()
export class AgentChatChannelMetadataService {
  constructor(
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

  async findChannelByUniversalIdentifier({
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

  async createChannel({
    workspaceId,
    callingApplication,
    universalIdentifier,
    ...channelToCreate
  }: ChannelToCreate & {
    workspaceId: string;
    callingApplication: FlatApplication | undefined;
    universalIdentifier?: string | null;
  }): Promise<FlatAgentChatChannelWithRoleIds> {
    const actingFlatApplication = await this.findActingFlatApplication({
      workspaceId,
      callingApplication,
    });

    const channel = await this.findOrInsertChannel({
      ...channelToCreate,
      workspaceId,
      applicationUniversalIdentifier: actingFlatApplication.universalIdentifier,
      universalIdentifier: isDefined(universalIdentifier)
        ? validateAgentChatChannelUniversalIdentifierOrThrow(
            universalIdentifier,
          )
        : v4(),
      shouldPickAvailableName: isDefined(
        getScopedCallingApplication(callingApplication),
      ),
    });

    assertAgentChatChannelUniversalIdentifierNotTakenOrThrow({
      channel,
      applicationId: actingFlatApplication.id,
    });

    return channel;
  }

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
    const actingFlatApplication = await this.findActingFlatApplication({
      workspaceId,
      callingApplication,
    });
    const now = new Date().toISOString();

    const definedChanges = removeUndefinedFields({
      ...changes,
      ...(isDefined(changes.name)
        ? { name: validateAgentChatChannelNameOrThrow(changes.name) }
        : {}),
    });

    if (isDefined(definedChanges.name)) {
      assertAgentChatChannelNameNotTakenOrThrow({
        name: definedChanges.name,
        universalIdentifier: channel.universalIdentifier,
        flatAgentChatChannelMaps: channelMaps.flatAgentChatChannelMaps,
      });
    }

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
      applicationUniversalIdentifier: actingFlatApplication.universalIdentifier,
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
      applicationUniversalIdentifier: actingFlatApplication.universalIdentifier,
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
    channelId,
  }: {
    workspaceId: string;
    channelId: string;
  }): Promise<FlatAgentChatChannelWithRoleIds> {
    const workspaceCustomFlatApplication =
      await this.findWorkspaceCustomFlatApplication(workspaceId);
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

    await this.runMigration({
      workspaceId,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
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

  private async insertChannel({
    workspaceId,
    applicationUniversalIdentifier,
    universalIdentifier,
    shouldPickAvailableName,
    name,
    icon,
    color,
    roleIds,
  }: ChannelToInsert): Promise<FlatAgentChatChannelWithRoleIds> {
    const channelMaps = await this.getChannelMaps(workspaceId);
    const requestedChannelName = validateAgentChatChannelNameOrThrow(name);
    const channelName = shouldPickAvailableName
      ? getAvailableAgentChatChannelName({
          name: requestedChannelName,
          takenNames: Object.values(
            channelMaps.flatAgentChatChannelMaps.byUniversalIdentifier,
          )
            .filter(isDefined)
            .map((channel) => channel.name),
        })
      : requestedChannelName;
    const now = new Date().toISOString();
    const channelId = v4();

    assertAgentChatChannelNameNotTakenOrThrow({
      name: channelName,
      universalIdentifier,
      flatAgentChatChannelMaps: channelMaps.flatAgentChatChannelMaps,
    });

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
      applicationUniversalIdentifier,
      channelsToCreate: [
        {
          id: channelId,
          universalIdentifier,
          name: channelName,
          icon,
          color,
          position: lastPosition + 1,
          channelRoleUniversalIdentifiers: [],
          navigationMenuItemUniversalIdentifiers: [],
          applicationUniversalIdentifier,
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
        applicationUniversalIdentifier,
        now,
      }),
    });

    return this.findChannelOrThrow({ workspaceId, channelId });
  }

  private async findOrInsertChannel(
    channelToInsert: ChannelToInsert,
  ): Promise<FlatAgentChatChannelWithRoleIds> {
    const existingChannel =
      await this.findChannelByUniversalIdentifier(channelToInsert);

    if (isDefined(existingChannel)) {
      return existingChannel;
    }

    try {
      return await this.insertChannel(channelToInsert);
    } catch (error) {
      await this.flatEntityMapsCacheService.invalidateFlatEntityMaps({
        workspaceId: channelToInsert.workspaceId,
        flatMapsKeys: [
          'flatAgentChatChannelMaps',
          'flatAgentChatChannelRoleMaps',
        ],
      });

      const concurrentlyCreatedChannel =
        await this.findChannelByUniversalIdentifier(channelToInsert);

      if (!isDefined(concurrentlyCreatedChannel)) {
        throw error;
      }

      return concurrentlyCreatedChannel;
    }
  }

  private async findActingFlatApplication({
    workspaceId,
    callingApplication,
  }: {
    workspaceId: string;
    callingApplication: FlatApplication | undefined;
  }): Promise<FlatApplication> {
    return (
      getScopedCallingApplication(callingApplication) ??
      (await this.findWorkspaceCustomFlatApplication(workspaceId))
    );
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
