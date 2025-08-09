import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Field, ID, ObjectType, Query, Resolver } from '@nestjs/graphql';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { NestboxAiService, Agent as ServiceAgent } from './nestbox-ai.service';

@ObjectType('NestboxAgent')
export class NestboxAgent {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  type: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}

@Resolver(() => NestboxAgent)
@UseGuards(WorkspaceAuthGuard)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class NestboxAiResolver {
  private readonly logger = new Logger(NestboxAiResolver.name);

  constructor(private readonly nestboxAiService: NestboxAiService) {}

  @Query(() => [NestboxAgent], { nullable: true })
  async agents(@AuthWorkspace() workspace: Workspace): Promise<ServiceAgent[] | null> {
    // console.log('NestboxAiResolver.agents called'); // Added log
    try {
      const agents = await this.nestboxAiService.getAllAgents();
      // this.logger.log(`Successfully retrieved ${agents.length} agents for workspace ${workspace.id}`);
      return agents || [];
    } catch (error) {
      this.logger.error('Error in agents resolver:', error);
      return null;
    }
  }
} 