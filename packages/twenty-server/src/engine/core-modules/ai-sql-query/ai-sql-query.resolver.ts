import { ForbiddenException, UseGuards } from '@nestjs/common';
import { Args, ArgsType, Field, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AISQLQueryService } from 'src/engine/core-modules/ai-sql-query/ai-sql-query.service';
import { AISQLQueryResult } from 'src/engine/core-modules/ai-sql-query/dtos/ai-sql-query-result.dto';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';

@ArgsType()
class GetAISQLQueryArgs {
  @Field(() => String)
  text: string;
}

@UseGuards(JwtAuthGuard)
@Resolver(() => AISQLQueryResult)
export class AISQLQueryResolver {
  constructor(
    private readonly aiSqlQueryService: AISQLQueryService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  @Query(() => AISQLQueryResult)
  async getAISQLQuery(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @AuthUser() user: User,
    @Args() { text }: GetAISQLQueryArgs,
  ) {
    const isCopilotEnabledFeatureFlag =
      await this.featureFlagRepository.findOneBy({
        workspaceId,
        key: FeatureFlagKey.IsCopilotEnabled,
        value: true,
      });

    if (!isCopilotEnabledFeatureFlag?.value) {
      throw new ForbiddenException(
        `${FeatureFlagKey.IsCopilotEnabled} feature flag is disabled`,
      );
    }

    const traceMetadata = {
      userId: user.id,
      userEmail: user.email,
    };

    return this.aiSqlQueryService.generateAndExecute(
      workspaceId,
      text,
      traceMetadata,
    );
  }
}
