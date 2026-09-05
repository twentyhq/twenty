import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { type FeatureFlagKey } from 'twenty-shared/types';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { TypedReflect } from 'src/utils/typed-reflect';

export const FEATURE_FLAG_KEY = 'feature-flag-metadata-args';

export function RequireFeatureFlag(featureFlag: FeatureFlagKey) {
  return (
    target: object,
    _propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ): void => {
    TypedReflect.defineMetadata(
      FEATURE_FLAG_KEY,
      featureFlag,
      descriptor?.value || target,
    );
  };
}

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const workspaceId = request.workspace?.id;

    if (!workspaceId) {
      return false;
    }

    // A handler-level flag wins over a class-level one, so a resolver can be
    // gated as a whole and still tighten a single field.
    const featureFlag = this.reflector.getAllAndOverride<FeatureFlagKey>(
      FEATURE_FLAG_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!featureFlag) {
      return true;
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
