import { Args, Query, Resolver, ArgsType, Field } from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { TextToSQLService } from 'src/engine/core-modules/text-to-sql/text-to-sql.service';
import { TextToSQLQueryResult } from 'src/engine/core-modules/text-to-sql/dtos/text-to-sql-query-result.dto';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';

@ArgsType()
class GetTextToSQLArgs {
  @Field(() => String)
  text: string;
}

@UseGuards(JwtAuthGuard)
@Resolver(() => TextToSQLQueryResult)
export class TextToSQLResolver {
  constructor(
    private readonly textToSQLService: TextToSQLService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  @Query(() => TextToSQLQueryResult)
  async getTextToSQL(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args() { text }: GetTextToSQLArgs,
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

    return this.textToSQLService.query(workspaceId, text);
  }
}
