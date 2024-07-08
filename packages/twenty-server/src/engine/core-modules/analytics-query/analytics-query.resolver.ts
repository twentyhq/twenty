import { Args, Resolver, ArgsType, Field, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { User } from 'src/engine/core-modules/user/user.entity';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AnalyticsQueryService } from 'src/engine/core-modules/analytics-query/analytics-query.service';
import { AnalyticsQueryResult } from 'src/engine/core-modules/analytics-query/dtos/analytics-query-result.dto';

@ArgsType()
class GetAnalyticsQueryArgs {
  @Field(() => String)
  analyticsQueryId: string;
}

@UseGuards(JwtAuthGuard)
@Resolver()
export class AnalyticsQueryResolver {
  constructor(private readonly analyticsQueryService: AnalyticsQueryService) {}

  @Mutation(() => AnalyticsQueryResult)
  async runAnalyticsQuery(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @AuthUser() user: User,
    @Args() { analyticsQueryId }: GetAnalyticsQueryArgs,
  ) {
    return await this.analyticsQueryService.run(analyticsQueryId);
  }
}
