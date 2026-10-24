import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  mixin,
  SetMetadata,
  type Type,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { type FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FEATURE_FLAG_GUARD_CONFIG_KEY } from 'src/engine/guards/constants/feature-flag-guard-config-key.constant';

export const FeatureFlagGuard = (
  featureFlag: FeatureFlagKey,
): Type<CanActivate> => {
  @Injectable()
  @SetMetadata(FEATURE_FLAG_GUARD_CONFIG_KEY, featureFlag)
  class FeatureFlagMixin implements CanActivate {
    constructor(private readonly featureFlagService: FeatureFlagService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const ctx = GqlExecutionContext.create(context);
      const workspaceId = ctx.getContext().req.workspace?.id;

      if (!isDefined(workspaceId)) {
        return false;
      }

      const isEnabled = await this.featureFlagService.isFeatureEnabled(
        featureFlag,
        workspaceId,
      );

      if (!isEnabled) {
        throw new ForbiddenException(
          `Feature flag "${featureFlag}" is not enabled for this workspace`,
        );
      }

      return true;
    }
  }

  return mixin(FeatureFlagMixin);
};
