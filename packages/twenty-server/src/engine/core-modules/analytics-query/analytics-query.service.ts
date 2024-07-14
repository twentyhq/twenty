import { Injectable } from '@nestjs/common';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceQueryRunnerService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { ChartResult } from 'src/engine/core-modules/analytics-query/dtos/analytics-query-result.dto';
import { ChartWorkspaceEntity } from 'src/modules/charts/standard-objects/chart.workspace-entity';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

@Injectable()
export class AnalyticsQueryService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly workspaceQueryRunnerService: WorkspaceQueryRunnerService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  async run(workspaceId: string, chartId: string): Promise<ChartResult> {
    const repository =
      await this.twentyORMManager.getRepository(ChartWorkspaceEntity);
    const chart = await repository.findOneBy({ id: chartId });

    console.log(
      'analyticsQueryService.run - chart',
      JSON.stringify(chart, undefined, 2),
    );

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const objectMetadata =
      await this.objectMetadataService.findOneOrFailWithinWorkspace(
        workspaceId,
        {
          where: { nameSingular: chart?.sourceObjectNameSingular },
        },
      );

    const sqlQuery = `
SELECT COUNT(*) as company_count, address
FROM ${dataSourceSchema}."${computeObjectTargetTable(objectMetadata)}"
GROUP BY address
ORDER BY company_count DESC
LIMIT 10;
`;

    console.log('analyticsQueryService.run - sqlQuery', sqlQuery);

    const result = await this.workspaceDataSourceService.executeRawQuery(
      sqlQuery,
      [],
      workspaceId,
    );

    console.log(
      'analyticsQueryService.run - result',
      JSON.stringify(result, undefined, 2),
    );

    return { chartResult: JSON.stringify(result) };
  }
}
