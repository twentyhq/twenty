import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import axios from 'axios';
import semver from 'semver';
import { Repository } from 'typeorm';

import { ConfigVariable } from 'src/engine/core-modules/admin-panel/dtos/config-variable.dto';
import { ConfigVariablesGroupData } from 'src/engine/core-modules/admin-panel/dtos/config-variables-group.dto';
import { ConfigVariablesOutput } from 'src/engine/core-modules/admin-panel/dtos/config-variables.output';
import { UserLookup } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.entity';
import { VersionInfo } from 'src/engine/core-modules/admin-panel/dtos/version-info.dto';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { CONFIG_VARIABLES_GROUP_METADATA } from 'src/engine/core-modules/twenty-config/constants/config-variables-group-metadata';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';

@Injectable()
export class AdminPanelService {
  constructor(
    private readonly loginTokenService: LoginTokenService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly domainManagerService: DomainManagerService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
  ) {}

  async impersonate(userId: string, workspaceId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        workspaces: {
          workspaceId,
          workspace: {
            allowImpersonation: true,
          },
        },
      },
      relations: ['workspaces', 'workspaces.workspace'],
    });

    userValidator.assertIsDefinedOrThrow(
      user,
      new AuthException(
        'User not found or impersonation not enable on workspace',
        AuthExceptionCode.INVALID_INPUT,
      ),
    );

    const loginToken = await this.loginTokenService.generateLoginToken(
      user.email,
      user.workspaces[0].workspace.id,
    );

    return {
      workspace: {
        id: user.workspaces[0].workspace.id,
        workspaceUrls: this.domainManagerService.getWorkspaceUrls(
          user.workspaces[0].workspace,
        ),
      },
      loginToken,
    };
  }

  async userLookup(userIdentifier: string): Promise<UserLookup> {
    const isEmail = userIdentifier.includes('@');

    const targetUser = await this.userRepository.findOne({
      where: isEmail ? { email: userIdentifier } : { id: userIdentifier },
      relations: [
        'workspaces',
        'workspaces.workspace',
        'workspaces.workspace.workspaceUsers',
        'workspaces.workspace.workspaceUsers.user',
        'workspaces.workspace.featureFlags',
      ],
    });

    userValidator.assertIsDefinedOrThrow(
      targetUser,
      new AuthException('User not found', AuthExceptionCode.INVALID_INPUT),
    );

    const allFeatureFlagKeys = Object.values(FeatureFlagKey);

    return {
      user: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
      },
      workspaces: targetUser.workspaces.map((userWorkspace) => ({
        id: userWorkspace.workspace.id,
        name: userWorkspace.workspace.displayName ?? '',
        totalUsers: userWorkspace.workspace.workspaceUsers.length,
        logo: userWorkspace.workspace.logo,
        allowImpersonation: userWorkspace.workspace.allowImpersonation,
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
        })) as FeatureFlag[],
      })),
    };
  }

  getConfigVariablesGrouped(): ConfigVariablesOutput {
    const rawEnvVars = this.twentyConfigService.getAll();
    const groupedData = new Map<ConfigVariablesGroup, ConfigVariable[]>();

    for (const [varName, { value, metadata }] of Object.entries(rawEnvVars)) {
      const { group, description } = metadata;

      const envVar: ConfigVariable = {
        name: varName,
        description,
        value: String(value),
        isSensitive: metadata.isSensitive ?? false,
      };

      if (!groupedData.has(group)) {
        groupedData.set(group, []);
      }

      groupedData.get(group)?.push(envVar);
    }

    const groups: ConfigVariablesGroupData[] = Array.from(groupedData.entries())
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

  async getVersionInfo(): Promise<VersionInfo> {
    const currentVersion = this.twentyConfigService.get('APP_VERSION');

    try {
      const response = await axios.get(
        'https://hub.docker.com/v2/repositories/twentycrm/twenty/tags?page_size=100',
      );

      const versions = response.data.results
        .filter((tag) => tag && tag.name !== 'latest')
        .map((tag) => semver.coerce(tag.name)?.version)
        .filter((version) => version !== undefined);

      if (versions.length === 0) {
        return { currentVersion, latestVersion: 'latest' };
      }

      versions.sort((a, b) => semver.compare(b, a));
      const latestVersion = versions[0];

      return { currentVersion, latestVersion };
    } catch (error) {
      return { currentVersion, latestVersion: 'latest' };
    }
  }
}
