import { Args, Query, Resolver, ArgsType, Field } from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AskAIService } from 'src/engine/core-modules/ask-ai/ask-ai.service';
import { AskAIQueryResult } from 'src/engine/core-modules/ask-ai/dtos/ask-ai-query-result.dto';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';

@ArgsType()
class GetAskAIArgs {
  @Field(() => String)
  text: string;
}

@UseGuards(JwtAuthGuard)
@Resolver(() => AskAIQueryResult)
export class AskAIResolver {
  constructor(
    private readonly askAIService: AskAIService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  @Query(() => AskAIQueryResult)
  async getAskAI(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args() { text }: GetAskAIArgs,
  ) {
    const isAskAIEnabledFeatureFlag =
      await this.featureFlagRepository.findOneBy({
        workspaceId,
        key: FeatureFlagKeys.IsAskAIEnabled,
        value: true,
      });

    if (!isAskAIEnabledFeatureFlag?.value) {
      throw new ForbiddenException(
        `${FeatureFlagKeys.IsAskAIEnabled} feature flag is disabled`,
      );
    }

    return this.askAIService.query(workspaceId, text);
  }
}
