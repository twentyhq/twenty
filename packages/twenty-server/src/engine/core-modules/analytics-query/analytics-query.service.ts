import { Injectable } from '@nestjs/common';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceQueryRunnerService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { AnalyticsQueryResult } from 'src/engine/core-modules/analytics-query/dtos/analytics-query-result.dto';
import { ChartWorkspaceEntity } from 'src/modules/charts/standard-objects/chart.workspace-entity';

@Injectable()
export class AnalyticsQueryService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly workspaceQueryRunnerService: WorkspaceQueryRunnerService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  async run(chartId: string): Promise<AnalyticsQueryResult> {
    const repository =
      await this.twentyORMManager.getRepository(ChartWorkspaceEntity);
    const chart = await repository.findOneBy({ id: chartId });

    return { analyticsQueryResult: 'test' };
  }
}
