import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { ChartResult } from 'src/engine/core-modules/analytics-query/dtos/analytics-query-result.dto';
import {
  ChartMeasure,
  ChartWorkspaceEntity,
} from 'src/modules/charts/standard-objects/chart.workspace-entity';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import {
  RelationMetadataEntity,
  RelationMetadataType,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';

@Injectable()
export class AnalyticsQueryService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly objectMetadataService: ObjectMetadataService,
    @InjectRepository(RelationMetadataEntity, 'metadata')
    private readonly relationMetadataRepository: Repository<RelationMetadataEntity>,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  private async getRelationMetadata(
    workspaceId: string,
    fieldMetadataId?: string,
  ) {
    if (!fieldMetadataId) return;
    const [relationMetadata] = await this.relationMetadataRepository.find({
      where: [
        {
          fromFieldMetadataId: fieldMetadataId,
        },
        {
          toFieldMetadataId: fieldMetadataId,
        },
      ],
      relations: [
        'fromObjectMetadata',
        'toObjectMetadata',
        'fromFieldMetadata',
        'toFieldMetadata',
        'fromObjectMetadata.fields',
        'toObjectMetadata.fields',
      ],
    });

    if (relationMetadata instanceof NotFoundException) throw relationMetadata;

    return relationMetadata;
  }

  /**
   *
   * @param fieldPath e.g. 'people.employees'
   */
  private async getJoinOperations(
    workspaceId: string,
    sourceObjectNameSingular: string,
    fieldPath: string,
  ) {
    const fieldPathParts = fieldPath.split('.');

    if (fieldPathParts.length < 2) return [];

    const relationPathParts = fieldPathParts.slice(0, -1);

    let objectMetadata =
      await this.objectMetadataService.findOneOrFailWithinWorkspace(
        workspaceId,
        {
          where: { nameSingular: sourceObjectNameSingular },
        },
      );

    const tables: {
      fromTableName: string;
      fromFieldName: string;
      toFieldName?: string;
      toTableName?: string;
    }[] = [];

    for (const [index, fieldName] of relationPathParts.entries()) {
      const fieldMetadataId = objectMetadata.fields.find(
        (field) => field.name === fieldName,
      )?.id;

      const relationMetadata = await this.getRelationMetadata(
        workspaceId,
        fieldMetadataId,
      );

      switch (relationMetadata?.relationType) {
        case RelationMetadataType.ONE_TO_MANY: {
          await tables.push({
            fromTableName: await computeObjectTargetTable(
              relationMetadata.fromObjectMetadata,
            ),
            fromFieldName: 'id',
            toTableName: await computeObjectTargetTable(
              relationMetadata.toObjectMetadata,
            ),
            toFieldName: computeColumnName(
              relationMetadata.toFieldMetadata.name,
              { isForeignKey: true },
            ),
          });
          break;
        }
        default:
          throw new Error(
            `Chart query construction is not implemented for relation type '${relationMetadata?.relationType}'`,
          );
      }

      const oppositeObjectMetadata =
        relationMetadata?.fromObjectMetadataId === objectMetadata.id
          ? relationMetadata?.toObjectMetadata
          : relationMetadata?.fromObjectMetadata;

      if (!oppositeObjectMetadata) throw new Error();

      console.log(
        'fieldMetadataId',
        fieldMetadataId,
        oppositeObjectMetadata.fields.map(({ name }) => name),
        fieldName,
      );

      objectMetadata = oppositeObjectMetadata;
    }

    return tables;
  }

  /**
   *
   * @param chartMeasure
   * @param targetSelectColumn e.g. 'table_1.employees'
   * @returns
   */
  private getMeasureSelectColumn(
    chartMeasure: ChartMeasure,
    targetSelectColumn: string,
  ) {
    switch (chartMeasure) {
      case ChartMeasure.COUNT:
        return 'COUNT(*) as measure';
      case ChartMeasure.AVERAGE:
        return `AVG(${targetSelectColumn}) as measure`;
      case ChartMeasure.MIN:
        return `MIN(${targetSelectColumn}) as measure`;
      case ChartMeasure.MAX:
        return `MAX(${targetSelectColumn}) as measure`;
      case ChartMeasure.SUM:
        return `SUM(${targetSelectColumn}) as measure`;
    }
  }

  async run(workspaceId: string, chartId: string): Promise<ChartResult> {
    const repository =
      await this.twentyORMManager.getRepository(ChartWorkspaceEntity);
    const chart = await repository.findOneByOrFail({ id: chartId });

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const objectMetadata =
      await this.objectMetadataService.findOneOrFailWithinWorkspace(
        workspaceId,
        {
          where: { nameSingular: chart?.sourceObjectNameSingular },
        },
      );

    const joinOperations = await this.getJoinOperations(
      workspaceId,
      chart.sourceObjectNameSingular,
      chart.fieldPath,
    );

    const measureSelectColumn = this.getMeasureSelectColumn(
      chart.measure,
      chart.fieldPath,
    );
    const groupByClause = chart?.groupBy && `GROUP BY ${chart?.groupBy}`;

    const selectColumns = [measureSelectColumn, chart?.groupBy].filter(
      (col) => !!col,
    );

    const joinClauses = joinOperations
      .map(
        (joinOperation, i) =>
          `JOIN "${dataSourceSchema}"."${joinOperation.toTableName}" table_${
            i + 1
          } ON table_${i}."${joinOperation.fromFieldName}" = table_${i + 1}."${
            joinOperation.toFieldName
          }"`,
      )
      .join('\n');

    const sqlQuery = `
SELECT ${selectColumns.join(', ')}
FROM "${dataSourceSchema}"."${computeObjectTargetTable(objectMetadata)}" table_0
${joinClauses}
${groupByClause}
LIMIT 1000;
`.trim();

    console.log('sqlQuery', sqlQuery);

    const result = await this.workspaceDataSourceService.executeRawQuery(
      sqlQuery,
      [],
      workspaceId,
    );

    console.log('result', JSON.stringify(result, undefined, 2));

    return { chartResult: JSON.stringify(result) };
  }
}
