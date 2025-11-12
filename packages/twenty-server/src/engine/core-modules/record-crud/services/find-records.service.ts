import { Injectable, Logger } from '@nestjs/common';

import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { type FindRecordsParams } from 'src/engine/core-modules/record-crud/types/find-records-params.type';
import { CommonApiContextBuilder } from 'src/engine/core-modules/record-crud/utils/common-api-context-builder.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

@Injectable()
export class FindRecordsService {
  private readonly logger = new Logger(FindRecordsService.name);

  constructor(
    private readonly commonFindManyRunner: CommonFindManyQueryRunnerService,
    private readonly commonApiContextBuilder: CommonApiContextBuilder,
  ) {}

  async execute(
    params: FindRecordsParams,
  ): Promise<ToolOutput<{ records: unknown[]; totalCount: number }>> {
    const {
      objectName,
      filter,
      orderBy,
      limit,
      offset,
      workspaceId,
      rolePermissionConfig,
      userWorkspaceId,
      apiKey,
      createdBy,
    } = params;

    try {
      const { queryRunnerContext, selectedFields } =
        await this.commonApiContextBuilder.build({
          objectName,
          workspaceId,
          rolePermissionConfig,
          userWorkspaceId,
          apiKey,
          actorContext: createdBy,
        });

      const result = await this.commonFindManyRunner.execute(
        {
          filter: filter || {},
          orderBy,
          first: limit ?? 50,
          offset: offset ?? 0,
          selectedFields,
        },
        queryRunnerContext,
      );

      return {
        success: true,
        message: `Found ${result.records.length} records in ${objectName}`,
        result: {
          records: result.records,
          totalCount: result.totalCount,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to find records: ${error}`);

      return {
        success: false,
        message: `Failed to find records in ${objectName}`,
        error:
          error instanceof Error ? error.message : 'Failed to find records',
      };
    }
  }
}
