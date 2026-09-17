import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { UsageLimitStockService } from 'src/engine/core-modules/usage-limit/services/usage-limit-stock.service';
import { buildRecordCountQuery } from 'src/engine/core-modules/usage-limit/utils/build-record-count-query.util';
import { buildRecordStockTableNames } from 'src/engine/core-modules/usage-limit/utils/build-record-stock-table-names.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const RECORD_STOCK_SCOPE = {
  resourceType: UsageResourceType.RECORD,
  operationType: UsageOperationType.RECORD_WRITE,
  spenders: {},
};

@Injectable()
export class WorkspaceRecordStockService {
  constructor(
    private readonly usageLimitStockService: UsageLimitStockService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async assertRecordStockAvailable({
    workspaceId,
    quantity,
    flatObjectMetadataMaps,
  }: {
    workspaceId: string;
    quantity: number;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  }): Promise<void> {
    if (quantity <= 0) {
      return;
    }

    await this.usageLimitStockService.assertStockAvailable({
      ...RECORD_STOCK_SCOPE,
      workspaceId,
      cost: { quantity },
      computeUsedStock: () =>
        this.computeRecordUsedStock({ workspaceId, flatObjectMetadataMaps }),
    });
  }

  async acquireRecordStock({
    workspaceId,
    quantity,
  }: {
    workspaceId: string;
    quantity: number;
  }): Promise<void> {
    if (quantity <= 0) {
      return;
    }

    await this.usageLimitStockService.acquireStock({
      ...RECORD_STOCK_SCOPE,
      workspaceId,
      cost: { quantity },
    });
  }

  async releaseRecordStock({
    workspaceId,
    quantity,
  }: {
    workspaceId: string;
    quantity: number;
  }): Promise<void> {
    if (quantity <= 0) {
      return;
    }

    await this.usageLimitStockService.releaseStock({
      ...RECORD_STOCK_SCOPE,
      workspaceId,
      cost: { quantity },
    });
  }

  private async computeRecordUsedStock({
    workspaceId,
    flatObjectMetadataMaps,
  }: {
    workspaceId: string;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  }): Promise<{ quantity: number; bytes: number }> {
    const [used] = await this.coreDataSource.query<{ quantity: string }[]>(
      buildRecordCountQuery({
        schemaName: getWorkspaceSchemaName(workspaceId),
        tableNames: buildRecordStockTableNames(flatObjectMetadataMaps),
      }),
    );

    return { quantity: Number(used?.quantity ?? 0), bytes: 0 };
  }
}
