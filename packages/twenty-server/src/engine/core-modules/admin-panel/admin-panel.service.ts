import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import semver from 'semver';
import { FeatureFlagKey, FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import * as z from 'zod';

import { type AdminChatMessageDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-chat-message.dto';
import { type AdminPanelRecentUserDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-recent-user.dto';
import { type AdminPanelTopWorkspaceDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-top-workspace.dto';
import { type AdminWorkspaceChatThreadDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-workspace-chat-thread.dto';
import { type ConfigVariableDTO } from 'src/engine/core-modules/admin-panel/dtos/config-variable.dto';
import { type ConfigVariablesGroupDataDTO } from 'src/engine/core-modules/admin-panel/dtos/config-variables-group.dto';
import { type ConfigVariablesDTO } from 'src/engine/core-modules/admin-panel/dtos/config-variables.dto';
import { type UserLookup } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.dto';
import { type VersionInfoDTO } from 'src/engine/core-modules/admin-panel/dtos/version-info.dto';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_GROUP_METADATA } from 'src/engine/core-modules/twenty-config/constants/config-variables-group-metadata';
import { type ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';

@Injectable()
export class AdminPanelService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly fileUrlService: FileUrlService,
    private readonly secureHttpClientService: SecureHttpClientService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectRepository(FeatureFlagEntity)
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    @InjectRepository(AgentChatThreadEntity)
    private readonly agentChatThreadRepository: Repository<AgentChatThreadEntity>,
    @InjectRepository(AgentMessageEntity)
    private readonly agentMessageRepository: Repository<AgentMessageEntity>,
  ) {}

  async userLookup(userIdentifier: string): Promise<UserLookup> {
    const isEmail = userIdentifier.includes('@');
    const normalizedIdentifier = isEmail
      ? userIdentifier.toLowerCase()
      : userIdentifier;

    const targetUser = await this.userRepository.findOne({
      where: isEmail
        ? { email: normalizedIdentifier }
        : { id: normalizedIdentifier },
      relations: {
        userWorkspaces: {
          workspace: {
            workspaceUsers: {
              user: true,
            },
            featureFlags: true,
          },
        },
      },
    });

    userValidator.assertIsDefinedOrThrow(
      targetUser,
      new AuthException('User not found', AuthExceptionCode.INVALID_INPUT, {
        userFriendlyMessage: msg`User not found. Please check the email or ID.`,
      }),
    );

    const allFeatureFlagKeys = Object.values(FeatureFlagKey);

    return {
      user: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        createdAt: targetUser.createdAt,
      },
      workspaces: targetUser.userWorkspaces.map((userWorkspace) => ({
        id: userWorkspace.workspace.id,
        name: userWorkspace.workspace.displayName ?? '',
        totalUsers: userWorkspace.workspace.workspaceUsers.length,
        activationStatus: userWorkspace.workspace.activationStatus,
        createdAt: userWorkspace.workspace.createdAt,
        logo: isDefined(userWorkspace.workspace.logoFileId)
          ? this.fileUrlService.signFileByIdUrl({
              fileId: userWorkspace.workspace.logoFileId,
              workspaceId: userWorkspace.workspace.id,
              fileFolder: FileFolder.CorePicture,
            })
          : undefined,
        allowImpersonation: userWorkspace.workspace.allowImpersonation,
        workspaceUrls: this.workspaceDomainsService.getWorkspaceUrls({
          subdomain: userWorkspace.workspace.subdomain,
          customDomain: userWorkspace.workspace.customDomain,
          isCustomDomainEnabled: userWorkspace.workspace.isCustomDomainEnabled,
        }),
        users: userWorkspace.workspace.workspaceUsers
          .filter((workspaceUser) => isDefined(workspaceUser.user))
          .map((workspaceUser) => ({
            id: workspaceUser.user.id,
            email: workspaceUser.user.email,
            firstName: workspaceUser.user.firstName,
            lastName: workspaceUser.user.lastName,
            createdAt: workspaceUser.user.createdAt,
          })),
        featureFlags: allFeatureFlagKeys.map((key) => ({
          key,
          value:
            userWorkspace.workspace.featureFlags?.find(
              (flag) => flag.key === key,
            )?.value ?? false,
        })) as FeatureFlagEntity[],
      })),
    };
  }

  async workspaceLookup(workspaceId: string): Promise<UserLookup> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new AuthException(
        'Workspace not found',
        AuthExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`Workspace not found. Please check the ID.`,
        },
      );
    }

    const [workspaceUsers, featureFlags] = await Promise.all([
      this.userWorkspaceRepository.find({
        where: { workspaceId },
        relations: { user: true },
      }),
      this.featureFlagRepository.find({
        where: { workspaceId },
      }),
    ]);

    const allFeatureFlagKeys = Object.values(FeatureFlagKey);

    const workspaceInfo = {
      id: workspace.id,
      name: workspace.displayName ?? '',
      totalUsers: workspaceUsers.length,
      activationStatus: workspace.activationStatus,
      createdAt: workspace.createdAt,
      logo: isDefined(workspace.logoFileId)
        ? this.fileUrlService.signFileByIdUrl({
            fileId: workspace.logoFileId,
            workspaceId: workspace.id,
            fileFolder: FileFolder.CorePicture,
          })
        : undefined,
      allowImpersonation: workspace.allowImpersonation,
      workspaceUrls: this.workspaceDomainsService.getWorkspaceUrls({
        subdomain: workspace.subdomain,
        customDomain: workspace.customDomain,
        isCustomDomainEnabled: workspace.isCustomDomainEnabled,
      }),
      users: workspaceUsers
        .filter((wu) => isDefined(wu.user))
        .map((wu) => ({
          id: wu.user.id,
          email: wu.user.email,
          firstName: wu.user.firstName,
          lastName: wu.user.lastName,
          createdAt: wu.user.createdAt,
        })),
      featureFlags: allFeatureFlagKeys.map((key) => ({
        key,
        value: featureFlags.find((flag) => flag.key === key)?.value ?? false,
      })) as FeatureFlagEntity[],
    };

    const firstUser = workspaceUsers.find((wu) => isDefined(wu.user))?.user;

    return {
      user: {
        id: firstUser?.id ?? '',
        email: firstUser?.email ?? '',
        firstName: firstUser?.firstName,
        lastName: firstUser?.lastName,
        createdAt: firstUser?.createdAt ?? new Date(),
      },
      workspaces: [workspaceInfo],
    };
  }

  async getRecentUsers(
    searchTerm?: string,
  ): Promise<AdminPanelRecentUserDTO[]> {
    let whereClause = 'u."deletedAt" IS NULL';
    const params: unknown[] = [];

    if (searchTerm && searchTerm.trim().length > 0) {
      const term = `%${searchTerm.trim()}%`;

      whereClause += ` AND (u.email ILIKE $1 OR CONCAT(u."firstName", ' ', u."lastName") ILIKE $1 OR u.id::text ILIKE $1)`;
      params.push(term);
    }

    const results = await this.userRepository.manager.query(
      `SELECT * FROM (
         SELECT DISTINCT ON (u.id) u.id, u.email, u."firstName", u."lastName", u."createdAt",
                w."displayName" AS "workspaceName", w.id AS "workspaceId"
         FROM core."user" u
         LEFT JOIN core."userWorkspace" uw ON uw."userId" = u.id AND uw."deletedAt" IS NULL
         LEFT JOIN core.workspace w ON w.id = uw."workspaceId" AND w."deletedAt" IS NULL
         WHERE ${whereClause}
         ORDER BY u.id, u."createdAt" DESC
       ) sub
       ORDER BY sub."createdAt" DESC
       LIMIT 10`,
      params,
    );

    return results.map(
      (row: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        createdAt: Date;
        workspaceName: string | null;
        workspaceId: string | null;
      }) => ({
        id: row.id,
        email: row.email,
        firstName: row.firstName || null,
        lastName: row.lastName || null,
        createdAt: row.createdAt,
        workspaceName: row.workspaceName ?? null,
        workspaceId: row.workspaceId ?? null,
      }),
    );
  }

  async getTopWorkspaces(
    searchTerm?: string,
  ): Promise<AdminPanelTopWorkspaceDTO[]> {
    let whereClause = 'w."deletedAt" IS NULL';
    const params: unknown[] = [];

    if (searchTerm && searchTerm.trim().length > 0) {
      const term = `%${searchTerm.trim()}%`;

      whereClause += ` AND (w."displayName" ILIKE $1 OR w.subdomain ILIKE $1 OR w.id::text ILIKE $1)`;
      params.push(term);
    }

    const results = await this.workspaceRepository.manager.query(
      `SELECT w.id, w."displayName" AS name, w.subdomain, COUNT(uw.id)::int AS "totalUsers"
       FROM core.workspace w
       LEFT JOIN core."userWorkspace" uw ON uw."workspaceId" = w.id AND uw."deletedAt" IS NULL
       WHERE ${whereClause}
       GROUP BY w.id
       ORDER BY "totalUsers" DESC
       LIMIT 10`,
      params,
    );

    return results.map(
      (row: {
        id: string;
        name: string;
        subdomain: string;
        totalUsers: number;
      }) => ({
        id: row.id,
        name: row.name ?? '',
        subdomain: row.subdomain ?? '',
        totalUsers: row.totalUsers,
      }),
    );
  }

  private async assertWorkspaceAllowsImpersonation(
    workspaceId: string,
  ): Promise<void> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: { id: true, allowImpersonation: true },
    });

    if (!workspace) {
      throw new UserInputError('Workspace not found');
    }

    if (!workspace.allowImpersonation) {
      throw new UserInputError('This workspace has not enabled support access');
    }
  }

  async getWorkspaceChatThreads(
    workspaceId: string,
  ): Promise<AdminWorkspaceChatThreadDTO[]> {
    await this.assertWorkspaceAllowsImpersonation(workspaceId);

    const threads = await this.agentChatThreadRepository.find({
      where: { workspaceId },
      order: { updatedAt: 'DESC' },
      take: 100,
    });

    return threads.map((thread) => ({
      id: thread.id,
      title: thread.title,
      totalInputTokens: thread.totalInputTokens,
      totalOutputTokens: thread.totalOutputTokens,
      conversationSize: thread.conversationSize,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    }));
  }

  async getChatThreadMessages(threadId: string): Promise<{
    thread: AdminWorkspaceChatThreadDTO;
    messages: AdminChatMessageDTO[];
  }> {
    const thread = await this.agentChatThreadRepository.findOne({
      where: { id: threadId },
    });

    if (!thread) {
      throw new UserInputError('Thread not found');
    }

    await this.assertWorkspaceAllowsImpersonation(thread.workspaceId);

    const messages = await this.agentMessageRepository.find({
      where: { threadId },
      relations: { parts: true },
      order: { createdAt: 'ASC' },
    });

    return {
      thread: {
        id: thread.id,
        title: thread.title,
        totalInputTokens: thread.totalInputTokens,
        totalOutputTokens: thread.totalOutputTokens,
        conversationSize: thread.conversationSize,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
      },
      messages: messages.map((message) => ({
        id: message.id,
        role: message.role,
        parts: (message.parts ?? [])
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((part) => ({
            type: part.type,
            textContent: part.textContent,
            toolName: part.toolName,
          })),
        createdAt: message.createdAt,
      })),
    };
  }

  getConfigVariablesGrouped(): ConfigVariablesDTO {
    const rawEnvVars = this.twentyConfigService.getAll();
    const groupedData = new Map<ConfigVariablesGroup, ConfigVariableDTO[]>();

    for (const [varName, { value, metadata, source }] of Object.entries(
      rawEnvVars,
    )) {
      const { group, description } = metadata;

      if (metadata.isHiddenInAdminPanel) {
        continue;
      }

      const envVar: ConfigVariableDTO = {
        name: varName,
        description,
        value: value ?? null,
        isSensitive: metadata.isSensitive ?? false,
        isEnvOnly: metadata.isEnvOnly ?? false,
        type: metadata.type,
        options: metadata.options,
        source,
      };

      if (!groupedData.has(group)) {
        groupedData.set(group, []);
      }

      groupedData.get(group)?.push(envVar);
    }

    const groups: ConfigVariablesGroupDataDTO[] = Array.from(
      groupedData.entries(),
    )
      .filter(
        ([name]) => !CONFIG_VARIABLES_GROUP_METADATA[name].isHiddenInAdminPanel,
      )
      .sort((a, b) => {
        const positionA = CONFIG_VARIABLES_GROUP_METADATA[a[0]].position;
        const positionB = CONFIG_VARIABLES_GROUP_METADATA[b[0]].position;

        return positionA - positionB;
      })
      .map(([name, variables]) => ({
        name,
        description: CONFIG_VARIABLES_GROUP_METADATA[name].description,
        isHiddenOnLoad: CONFIG_VARIABLES_GROUP_METADATA[name].isHiddenOnLoad,
        variables: variables.sort((a, b) => a.name.localeCompare(b.name)),
      }));

    return { groups };
  }

  getConfigVariable(key: string): ConfigVariableDTO {
    const variableWithMetadata =
      this.twentyConfigService.getVariableWithMetadata(
        key as keyof ConfigVariables,
      );

    if (!variableWithMetadata) {
      throw new Error(`Config variable ${key} not found`);
    }

    const { value, metadata, source } = variableWithMetadata;

    return {
      name: key,
      description: metadata.description ?? '',
      value: value ?? null,
      isSensitive: metadata.isSensitive ?? false,
      isEnvOnly: metadata.isEnvOnly ?? false,
      type: metadata.type,
      options: metadata.options,
      source,
    };
  }

  async getVersionInfo(): Promise<VersionInfoDTO> {
    const currentVersion = this.twentyConfigService.get('APP_VERSION');

    try {
      const httpClient = this.secureHttpClientService.getHttpClient();

      const rawResponse = await httpClient.get<unknown>(
        'https://hub.docker.com/v2/repositories/twentycrm/twenty/tags?page_size=100',
      );
      const response = z
        .object({
          data: z.object({
            results: z.array(z.object({ name: z.string() })),
          }),
        })
        .parse(rawResponse);

      const versions = response.data.results
        .map((tag) => tag.name)
        .filter((name) => name !== 'latest' && semver.valid(name));

      if (versions.length === 0) {
        return { currentVersion, latestVersion: 'latest' };
      }

      versions.sort((a, b) => semver.compare(b, a));
      const latestVersion = versions[0];

      return { currentVersion, latestVersion };
    } catch {
      return { currentVersion, latestVersion: 'latest' };
    }
  }
}
