import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { EnvironmentVariable } from 'src/engine/core-modules/admin-panel/dtos/environment-variable.dto';
import { EnvironmentVariablesGroupData } from 'src/engine/core-modules/admin-panel/dtos/environment-variables-group.dto';
import { EnvironmentVariablesOutput } from 'src/engine/core-modules/admin-panel/dtos/environment-variables.output';
import { UserLookup } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { ENVIRONMENT_VARIABLES_GROUP_POSITION } from 'src/engine/core-modules/environment/constants/environment-variables-group-position';
import { ENVIRONMENT_VARIABLES_HIDDEN_GROUPS } from 'src/engine/core-modules/environment/constants/environment-variables-hidden-groups';
import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';
import { EnvironmentVariablesSubGroup } from 'src/engine/core-modules/environment/enums/environment-variables-sub-group.enum';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import {
  FeatureFlagException,
  FeatureFlagExceptionCode,
} from 'src/engine/core-modules/feature-flag/feature-flag.exception';
import { featureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/feature-flag.validate';
import { User } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';

@Injectable()
export class AdminPanelService {
  constructor(
    private readonly loginTokenService: LoginTokenService,
    private readonly environmentService: EnvironmentService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FeatureFlag, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlag>,
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
        subdomain: user.workspaces[0].workspace.subdomain,
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

  async updateWorkspaceFeatureFlags(
    workspaceId: string,
    featureFlag: FeatureFlagKey,
    value: boolean,
  ) {
    featureFlagValidator.assertIsFeatureFlagKey(
      featureFlag,
      new FeatureFlagException(
        'Invalid feature flag key',
        FeatureFlagExceptionCode.INVALID_FEATURE_FLAG_KEY,
      ),
    );

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      relations: ['featureFlags'],
    });

    workspaceValidator.assertIsDefinedOrThrow(
      workspace,
      new AuthException('Workspace not found', AuthExceptionCode.INVALID_INPUT),
    );

    const existingFlag = workspace.featureFlags?.find(
      (flag) => flag.key === FeatureFlagKey[featureFlag],
    );

    if (existingFlag) {
      await this.featureFlagRepository.update(existingFlag.id, { value });
    } else {
      await this.featureFlagRepository.save({
        key: FeatureFlagKey[featureFlag],
        value,
        workspaceId: workspace.id,
      });
    }
  }

  getEnvironmentVariablesGrouped(): EnvironmentVariablesOutput {
    const rawEnvVars = this.environmentService.getAll();
    const groupedData = new Map<
      EnvironmentVariablesGroup,
      {
        variables: EnvironmentVariable[];
        subgroups: Map<EnvironmentVariablesSubGroup, EnvironmentVariable[]>;
      }
    >();

    for (const [varName, { value, metadata }] of Object.entries(rawEnvVars)) {
      const { group, subGroup, description } = metadata;

      if (ENVIRONMENT_VARIABLES_HIDDEN_GROUPS.has(group)) {
        continue;
      }

      const envVar: EnvironmentVariable = {
        name: varName,
        description,
        value: String(value),
        sensitive: metadata.sensitive ?? false,
      };

      let currentGroup = groupedData.get(group);

      if (!currentGroup) {
        currentGroup = {
          variables: [],
          subgroups: new Map(),
        };
        groupedData.set(group, currentGroup);
      }

      if (subGroup) {
        let subgroupVars = currentGroup.subgroups.get(subGroup);

        if (!subgroupVars) {
          subgroupVars = [];
          currentGroup.subgroups.set(subGroup, subgroupVars);
        }
        subgroupVars.push(envVar);
      } else {
        currentGroup.variables.push(envVar);
      }
    }

    const groups: EnvironmentVariablesGroupData[] = Array.from(
      groupedData.entries(),
    )
      .sort((a, b) => {
        const positionA = ENVIRONMENT_VARIABLES_GROUP_POSITION[a[0]];
        const positionB = ENVIRONMENT_VARIABLES_GROUP_POSITION[b[0]];

        return positionA - positionB;
      })
      .map(([groupName, data]) => ({
        groupName,
        variables: data.variables.sort((a, b) => a.name.localeCompare(b.name)),
        subgroups: Array.from(data.subgroups.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([subgroupName, variables]) => ({
            subgroupName,
            variables,
          })),
      }));

    return { groups };
  }
}
