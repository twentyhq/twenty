import { Args, Resolver, ArgsType, Field, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { User } from 'src/engine/core-modules/user/user.entity';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { ChartService } from 'src/engine/core-modules/chart/chart.service';
import { ChartResult } from 'src/engine/core-modules/chart/dtos/chart-result.dto';

@ArgsType()
class ChartDataArgs {
  @Field(() => String)
  chartId: string;
}

@UseGuards(JwtAuthGuard)
@Resolver()
export class ChartResolver {
  constructor(private readonly chartService: ChartService) {}

  @Query(() => ChartResult)
  async chartData(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @AuthUser() user: User,
    @Args() { chartId }: ChartDataArgs,
  ) {
    return await this.chartService.run(workspaceId, chartId);
  }
}
