import { Args, Query, Resolver, ArgsType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { TextToSQLService } from 'src/engine/core-modules/text-to-sql/text-to-sql.service';
import { TextToSQLQueryResult } from 'src/engine/core-modules/text-to-sql/dtos/text-to-sql-query-result.dto';

@ArgsType()
class GetTextToSQLArgs {
  @Field(() => String)
  text: string;
}

@UseGuards(JwtAuthGuard)
@Resolver(() => TextToSQLQueryResult)
export class TextToSQLResolver {
  constructor(private readonly textToSQLService: TextToSQLService) {}

  @Query(() => TextToSQLQueryResult)
  async getTextToSQL(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args() { text }: GetTextToSQLArgs,
  ) {
    return this.textToSQLService.query(workspaceId, text);
  }
}
