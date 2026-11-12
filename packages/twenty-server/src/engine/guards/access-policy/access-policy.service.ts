import { ForbiddenException, Injectable } from '@nestjs/common';

import { buildWorkspaceAuthContextFromRequest } from 'src/engine/core-modules/auth/utils/build-workspace-auth-context-from-request.util';
import { type Request } from 'express';
import { type PermissionFlagType } from 'twenty-shared/constants';
import { type FeatureFlagKey } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { AuthPrincipalRefusedException } from 'src/engine/guards/exceptions/auth-principal-refused.exception';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';
import { type AuthPrincipalGuardConfig } from 'src/engine/guards/types/auth-principal-guard-config.type';
import { type AuthPrincipalVariant } from 'src/engine/guards/types/auth-principal-variant.type';
import { buildPermissionFlagDeniedException } from 'src/engine/guards/utils/build-permission-flag-denied-exception.util';
import { classifyAuthPrincipal } from 'src/engine/guards/utils/classify-auth-principal.util';
import { classifyWorkspaceAuthContext } from 'src/engine/guards/utils/classify-workspace-auth-context.util';
import { isAuthPrincipalVariantAccepted } from 'src/engine/guards/utils/is-auth-principal-variant-accepted.util';
import { withAgentsAdmitted } from 'src/engine/guards/access-policy/utils/with-agents-admitted.util';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';

// A workspace being created has no roles to check settings permissions against yet
const WORKSPACE_ACTIVATION_STATUSES_WITHOUT_ROLES = [
  WorkspaceActivationStatus.PENDING_CREATION,
  WorkspaceActivationStatus.ONGOING_CREATION,
];

@Injectable()
export class AccessPolicyService {
  constructor(
    private readonly settingPermissionsService: SettingPermissionsService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async assertRequestAccessPolicySatisfiedOrThrow({
    accessPolicy,
    request,
  }: {
    accessPolicy: AccessPolicy;
    request: Request;
  }): Promise<void> {
    if (
      !this.isAuthPrincipalAccepted({
        authPrincipals: accessPolicy.authPrincipals,
        authPrincipalVariant: classifyAuthPrincipal(request),
      })
    ) {
      throw new AuthPrincipalRefusedException();
    }

    const { workspace } = request;

    const disabledFeatureFlag = this.findDisabledFeatureFlag({
      accessPolicy,
      featureFlagsMap:
        isDefined(workspace) &&
        isNonEmptyArray(accessPolicy.requiredFeatureFlags)
          ? await this.featureFlagService.getWorkspaceFeatureFlagsMap(
              workspace.id,
            )
          : undefined,
    });

    if (isDefined(disabledFeatureFlag)) {
      throw new ForbiddenException(
        `Feature flag "${disabledFeatureFlag}" is not enabled for this workspace`,
      );
    }

    for (const permissionFlag of accessPolicy.requiredPermissionFlags) {
      if (
        !(await this.isSettingsPermissionGranted({ request, permissionFlag }))
      ) {
        throw buildPermissionFlagDeniedException();
      }
    }
  }

  async isToolAccessPolicySatisfied({
    accessPolicy,
    authContext,
    featureFlagsMap,
  }: {
    accessPolicy: AccessPolicy;
    authContext: WorkspaceAuthContext | undefined;
    featureFlagsMap: FeatureFlagMap;
  }): Promise<boolean> {
    if (
      !this.isAuthPrincipalAccepted({
        authPrincipals: withAgentsAdmitted(accessPolicy.authPrincipals),
        authPrincipalVariant: isDefined(authContext)
          ? classifyWorkspaceAuthContext(authContext)
          : undefined,
      }) ||
      isDefined(this.findDisabledFeatureFlag({ accessPolicy, featureFlagsMap }))
    ) {
      return false;
    }

    for (const permissionFlag of accessPolicy.requiredPermissionFlags) {
      if (
        !(await this.settingPermissionsService.hasPermissionFlag({
          authContext,
          permissionFlag: permissionFlag,
        }))
      ) {
        return false;
      }
    }

    return true;
  }

  private async isSettingsPermissionGranted({
    request,
    permissionFlag,
  }: {
    request: Request;
    permissionFlag: PermissionFlagType;
  }): Promise<boolean> {
    const { workspace } = request;

    if (!isDefined(workspace)) {
      return false;
    }

    if (
      WORKSPACE_ACTIVATION_STATUSES_WITHOUT_ROLES.includes(
        workspace.activationStatus,
      )
    ) {
      return true;
    }

    return this.settingPermissionsService.hasPermissionFlag({
      authContext: buildWorkspaceAuthContextFromRequest(request),
      permissionFlag: permissionFlag,
    });
  }

  private isAuthPrincipalAccepted({
    authPrincipals,
    authPrincipalVariant,
  }: {
    authPrincipals: AuthPrincipalGuardConfig;
    authPrincipalVariant: AuthPrincipalVariant | undefined;
  }): boolean {
    return (
      isDefined(authPrincipalVariant) &&
      isAuthPrincipalVariantAccepted({
        authPrincipalGuardConfig: authPrincipals,
        authPrincipalVariant,
      })
    );
  }

  private findDisabledFeatureFlag({
    accessPolicy: { requiredFeatureFlags = [] },
    featureFlagsMap,
  }: {
    accessPolicy: AccessPolicy;
    featureFlagsMap: FeatureFlagMap | undefined;
  }): FeatureFlagKey | undefined {
    for (const featureFlag of requiredFeatureFlags) {
      if (featureFlagsMap?.[featureFlag] !== true) {
        return featureFlag;
      }
    }

    return undefined;
  }
}
