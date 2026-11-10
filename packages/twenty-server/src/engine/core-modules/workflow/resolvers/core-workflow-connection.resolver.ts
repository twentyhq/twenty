import { Parent, ResolveField } from '@nestjs/graphql';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { CoreWorkflowConnectionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-connection.dto';
import { CoreWorkflowRunSummaryDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-run-summary.dto';
import { CoreWorkflowRunSummaryService } from 'src/engine/core-modules/workflow/services/core-workflow-run-summary.service';

@CoreResolver(() => CoreWorkflowConnectionDTO)
export class CoreWorkflowConnectionResolver {
  constructor(
    private readonly coreWorkflowRunSummaryService: CoreWorkflowRunSummaryService,
  ) {}

  // Resolved per page so only the rows a client loads are summarized, in one query
  @ResolveField(() => [CoreWorkflowRunSummaryDTO])
  async runSummaries(
    @Parent() connection: CoreWorkflowConnectionDTO,
  ): Promise<CoreWorkflowRunSummaryDTO[]> {
    return this.coreWorkflowRunSummaryService.findManyByCoreWorkflowIds(
      connection.edges.map(({ node }) => node.id),
    );
  }
}
