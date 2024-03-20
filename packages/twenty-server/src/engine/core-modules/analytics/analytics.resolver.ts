import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Request } from 'express';

import { OptionalJwtAuthGuard } from 'src/engine/guards/optional-jwt.auth.guard';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';

import { AnalyticsService } from './analytics.service';
import { Analytics } from './analytics.entity';

import { CreateAnalyticsInput } from './dto/create-analytics.input';

@UseGuards(OptionalJwtAuthGuard)
@Resolver(() => Analytics)
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Mutation(() => Analytics)
  track(
    @Args() createAnalyticsInput: CreateAnalyticsInput,
    @AuthWorkspace() workspace: Workspace | undefined,
    @AuthUser({ allowUndefined: true }) user: User | undefined,
    @Context('req') request: Request,
  ) {
    return this.analyticsService.create(
      createAnalyticsInput,
      user,
      workspace,
      request,
    );
  }
}
