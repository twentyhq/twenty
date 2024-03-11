import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Request } from 'express';

import { OptionalJwtAuthGuard } from 'src/guards/optional-jwt.auth.guard';
import { AuthWorkspace } from 'src/decorators/auth/auth-workspace.decorator';
import { AuthUser } from 'src/decorators/auth/auth-user.decorator';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { User } from 'src/core/user/user.entity';

import { AnalyticsService } from './analytics.service';
import { Analytics } from './analytics.entity';

import { CreateAnalyticsInput } from './dto/create-analytics.input';

@UseGuards(OptionalJwtAuthGuard)
@Resolver(() => Analytics)
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Mutation(() => Analytics)
  createEvent(
    @Args() createEventInput: CreateAnalyticsInput,
    @AuthWorkspace() workspace: Workspace | undefined,
    @AuthUser({ allowUndefined: true }) user: User | undefined,
    @Context('req') request: Request,
  ) {
    return this.analyticsService.create(
      createEventInput,
      user,
      workspace,
      request,
    );
  }
}
