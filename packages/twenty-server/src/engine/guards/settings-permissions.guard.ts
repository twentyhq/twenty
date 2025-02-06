import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Type,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { SettingsFeatures } from 'twenty-shared';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

export const SettingsPermissionsGuard = (
  requiredPermission: SettingsFeatures,
): Type<CanActivate> => {
  @Injectable()
  class SettingsGuardMixin extends SettingsPermissions {
    constructor(
      featureFlagService: FeatureFlagService,
      permissionsService: PermissionsService,
    ) {
      super(requiredPermission, featureFlagService, permissionsService);
    }
  }

  return SettingsGuardMixin;
};

@Injectable()
class SettingsPermissions implements CanActivate {
  constructor(
    protected readonly requiredPermission: SettingsFeatures,
    protected readonly featureFlagService: FeatureFlagService,
    protected readonly permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);

    const workspaceId = ctx.getContext().req.workspace.id;

    const permissionsEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IsPermissionsEnabled,
      workspaceId,
    );

    if (!permissionsEnabled) {
      return true;
    }

    const userWorkspaceId = ctx.getContext().req.userWorkspaceId;

    return await this.permissionsService.userHasWorkspaceSettingPermission({
      userWorkspaceId,
      _setting: this.requiredPermission,
    });
  }
}
