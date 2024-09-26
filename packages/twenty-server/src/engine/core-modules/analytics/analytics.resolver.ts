import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { Request } from 'express';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';

import { Analytics } from './analytics.entity';
import { AnalyticsService } from './analytics.service';

import { CreateAnalyticsInput } from './dtos/create-analytics.input';

@Resolver(() => Analytics)
export class AnalyticsResolver {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @Mutation(() => Analytics)
  track(
    @Args() createAnalyticsInput: CreateAnalyticsInput,
    @AuthWorkspace() workspace: Workspace | undefined,
    @AuthUser({ allowUndefined: true }) user: User | undefined,
    @Context('req') request: Request,
  ) {
    return this.analyticsService.create(
      createAnalyticsInput,
      user?.id,
      workspace?.id,
    );
  }
}
