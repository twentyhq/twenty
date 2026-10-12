import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatAgentChatChannelWithRoleIds } from 'src/engine/metadata-modules/agent-chat-channel/types/flat-agent-chat-channel-with-role-ids.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatAgentChatChannelRole } from 'src/engine/metadata-modules/flat-agent-chat-channel-role/types/flat-agent-chat-channel-role.type';
import { type FlatAgentChatChannel } from 'src/engine/metadata-modules/flat-agent-chat-channel/types/flat-agent-chat-channel.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityToCreateDeleteUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

type ChannelChanges = {
  name?: string;
  icon?: string | null;
  color?: string | null;
  position?: number;
  isOpenToEveryone?: boolean;
};

type ChannelMaps = {
  flatAgentChatChannelMaps: FlatEntityMaps<FlatAgentChatChannel>;
  flatAgentChatChannelRoleMaps: FlatEntityMaps<FlatAgentChatChannelRole>;
  flatRoleMaps: FlatEntityMaps<FlatRole>;
};

const withRoleIds = (
  channel: FlatAgentChatChannel,
  flatAgentChatChannelRoleMaps: FlatEntityMaps<FlatAgentChatChannelRole>,
): FlatAgentChatChannelWithRoleIds => ({
  ...channel,
  roleIds: channel.channelRoleIds
    .map(
      (channelRoleId) =>
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: channelRoleId,
          flatEntityMaps: flatAgentChatChannelRoleMaps,
        })?.roleId,
    )
    .filter(isDefined),
});

const buildChannelRolesToCreate = ({
  channelUniversalIdentifier,
  roleUniversalIdentifiers,
  applicationUniversalIdentifier,
  now,
}: {
  channelUniversalIdentifier: string;
  roleUniversalIdentifiers: string[];
  applicationUniversalIdentifier: string;
  now: string;
}) =>
  roleUniversalIdentifiers.map((roleUniversalIdentifier) => ({
    id: v4(),
    universalIdentifier: v4(),
    channelUniversalIdentifier,
    roleUniversalIdentifier,
    applicationUniversalIdentifier,
    createdAt: now,
    updatedAt: now,
  }));

// Channels are workspace metadata: who reads a channel's chats follows from
// whether it is open to everyone and from the roles linked to it
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
      .map((channel) => withRoleIds(channel, flatAgentChatChannelRoleMaps))
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

    return withRoleIds(
      this.findFlatChannelOrThrow(flatAgentChatChannelMaps, channelId),
      flatAgentChatChannelRoleMaps,
    );
  }

  async createChannel({
    workspaceId,
    name,
    icon,
    color,
    isOpenToEveryone,
    roleIds,
  }: {
    workspaceId: string;
    name: string;
    icon: string | null;
    color: string | null;
    isOpenToEveryone: boolean;
    roleIds: string[];
  }): Promise<FlatAgentChatChannelWithRoleIds> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const channelMaps = await this.getChannelMaps(workspaceId);
    const now = new Date().toISOString();
    const channelId = v4();
    const channelUniversalIdentifier = v4();

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
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      channelsToCreate: [
        {
          id: channelId,
          universalIdentifier: channelUniversalIdentifier,
          name: this.validateName(name),
          icon,
          color,
          position: lastPosition + 1,
          isOpenToEveryone,
          isCustom: true,
          channelRoleUniversalIdentifiers: [],
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          createdAt: now,
          updatedAt: now,
        },
      ],
      channelRolesToCreate: buildChannelRolesToCreate({
        channelUniversalIdentifier,
        roleUniversalIdentifiers: this.findRoleUniversalIdentifiers(
          channelMaps.flatRoleMaps,
          roleIds,
        ),
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        now,
      }),
    });

    return this.findChannelOrThrow({ workspaceId, channelId });
  }

  // Name, icon, color, position and access stay the workspace's own on a
  // channel an application ships, so they are edited the same way
  async updateChannel({
    workspaceId,
    channelId,
    changes,
    roleIds,
  }: {
    workspaceId: string;
    channelId: string;
    changes: ChannelChanges;
    roleIds?: string[];
  }): Promise<FlatAgentChatChannelWithRoleIds> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const channelMaps = await this.getChannelMaps(workspaceId);
    const channel = this.findFlatChannelOrThrow(
      channelMaps.flatAgentChatChannelMaps,
      channelId,
    );
    const now = new Date().toISOString();

    const definedChanges = Object.fromEntries(
      Object.entries({
        ...changes,
        name: isDefined(changes.name)
          ? this.validateName(changes.name)
          : undefined,
      }).filter(([, value]) => value !== undefined),
    );

    const currentChannelRoles = channel.channelRoleIds
      .map((channelRoleId) =>
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: channelRoleId,
          flatEntityMaps: channelMaps.flatAgentChatChannelRoleMaps,
        }),
      )
      .filter(isDefined);

    const requestedRoleUniversalIdentifiers = isDefined(roleIds)
      ? this.findRoleUniversalIdentifiers(channelMaps.flatRoleMaps, roleIds)
      : undefined;

    const channelRolesToDelete = isDefined(requestedRoleUniversalIdentifiers)
      ? currentChannelRoles.filter(
          ({ roleUniversalIdentifier }) =>
            !requestedRoleUniversalIdentifiers.includes(
              roleUniversalIdentifier,
            ),
        )
      : [];

    const channelRolesToCreate = buildChannelRolesToCreate({
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
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      now,
    });

    const isChannelChanged = Object.keys(definedChanges).length > 0;

    if (
      !isChannelChanged &&
      channelRolesToCreate.length === 0 &&
      channelRolesToDelete.length === 0
    ) {
      return withRoleIds(channel, channelMaps.flatAgentChatChannelRoleMaps);
    }

    await this.runMigration({
      workspaceId,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
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
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const { flatAgentChatChannelMaps, flatAgentChatChannelRoleMaps } =
      await this.getChannelMaps(workspaceId);
    const channel = this.findFlatChannelOrThrow(
      flatAgentChatChannelMaps,
      channelId,
    );

    // The standard sync would bring a standard channel back
    if (!channel.isCustom) {
      throw new AiException(
        'A standard channel cannot be deleted',
        AiExceptionCode.CHAT_CHANNEL_MANAGEMENT_FORBIDDEN,
      );
    }

    await this.runMigration({
      workspaceId,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      channelsToDelete: [channel],
      channelRolesToDelete: channel.channelRoleIds
        .map((channelRoleId) =>
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: channelRoleId,
            flatEntityMaps: flatAgentChatChannelRoleMaps,
          }),
        )
        .filter(isDefined),
    });

    return withRoleIds(channel, flatAgentChatChannelRoleMaps);
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
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    channelsToCreate?: FlatEntityToCreateDeleteUpdate<'agentChatChannel'>['flatEntityToCreate'];
    channelsToUpdate?: FlatAgentChatChannel[];
    channelsToDelete?: FlatAgentChatChannel[];
    channelRolesToCreate?: FlatEntityToCreateDeleteUpdate<'agentChatChannelRole'>['flatEntityToCreate'];
    channelRolesToDelete?: FlatAgentChatChannelRole[];
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

  private findFlatChannelOrThrow(
    flatAgentChatChannelMaps: FlatEntityMaps<FlatAgentChatChannel>,
    channelId: string,
  ): FlatAgentChatChannel {
    const channel = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: channelId,
      flatEntityMaps: flatAgentChatChannelMaps,
    });

    if (!isDefined(channel)) {
      throw new AiException(
        'Channel not found',
        AiExceptionCode.CHAT_CHANNEL_NOT_FOUND,
      );
    }

    return channel;
  }

  private findRoleUniversalIdentifiers(
    flatRoleMaps: FlatEntityMaps<FlatRole>,
    roleIds: string[],
  ): string[] {
    return [...new Set(roleIds)].map((roleId) => {
      const roleUniversalIdentifier =
        flatRoleMaps.universalIdentifierById[roleId];

      if (!isDefined(roleUniversalIdentifier)) {
        throw new AiException(
          'A channel can only be open to roles of its workspace',
          AiExceptionCode.INVALID_CHAT_CHANNEL_ROLE,
        );
      }

      return roleUniversalIdentifier;
    });
  }

  private validateName(name: string): string {
    const trimmedName = name.trim();

    if (!isNonEmptyString(trimmedName)) {
      throw new AiException(
        'A channel needs a name',
        AiExceptionCode.INVALID_CHAT_CHANNEL_NAME,
      );
    }

    return trimmedName;
  }
}
