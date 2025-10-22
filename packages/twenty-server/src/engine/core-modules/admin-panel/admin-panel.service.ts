import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import axios from 'axios';
import semver from 'semver';
import { Repository } from 'typeorm';
import * as z from 'zod';

import { type ConfigVariableDTO } from 'src/engine/core-modules/admin-panel/dtos/config-variable.dto';
import { type ConfigVariablesGroupDataDTO } from 'src/engine/core-modules/admin-panel/dtos/config-variables-group.dto';
import { type ConfigVariablesOutput } from 'src/engine/core-modules/admin-panel/dtos/config-variables.output';
import { type UserLookup } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.dto';
import { type VersionInfoDTO } from 'src/engine/core-modules/admin-panel/dtos/version-info.dto';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_GROUP_METADATA } from 'src/engine/core-modules/twenty-config/constants/config-variables-group-metadata';
import { type ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';

@Injectable()
export class AdminPanelService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly fileService: FileService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
      },
      workspaces: targetUser.userWorkspaces.map((userWorkspace) => ({
        id: userWorkspace.workspace.id,
        name: userWorkspace.workspace.displayName ?? '',
        totalUsers: userWorkspace.workspace.workspaceUsers.length,
        logo: userWorkspace.workspace.logo
          ? this.fileService.signFileUrl({
              url: userWorkspace.workspace.logo,
              workspaceId: userWorkspace.workspace.id,
            })
          : userWorkspace.workspace.logo,
        allowImpersonation: userWorkspace.workspace.allowImpersonation,
        workspaceUrls: this.workspaceDomainsService.getWorkspaceUrls({
          subdomain: userWorkspace.workspace.subdomain,
          customDomain: userWorkspace.workspace.customDomain,
          isCustomDomainEnabled: userWorkspace.workspace.isCustomDomainEnabled,
        }),
        users: userWorkspace.workspace.workspaceUsers.map((workspaceUser) => ({
          id: workspaceUser.user.id,
          email: workspaceUser.user.email,
          firstName: workspaceUser.user.firstName,
          lastName: workspaceUser.user.lastName,
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

  getConfigVariablesGrouped(): ConfigVariablesOutput {
    const rawEnvVars = this.twentyConfigService.getAll();
    const groupedData = new Map<ConfigVariablesGroup, ConfigVariableDTO[]>();

    for (const [varName, { value, metadata, source }] of Object.entries(
      rawEnvVars,
    )) {
      const { group, description } = metadata;

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
      const rawResponse = await axios.get<unknown>(
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
