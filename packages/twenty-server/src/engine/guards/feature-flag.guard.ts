import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  mixin,
  type Type,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { type FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';

export const FeatureFlagGuard = (
  featureFlag: FeatureFlagKey,
): Type<CanActivate> => {
  @Injectable()
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
