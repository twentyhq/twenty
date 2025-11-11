import { Injectable, Logger } from '@nestjs/common';

import { CommonCreateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-one-query-runner.service';
import { type UpsertRecordParams } from 'src/engine/core-modules/record-crud/types/upsert-record-params.type';
import { CommonApiContextBuilder } from 'src/engine/core-modules/record-crud/utils/common-api-context-builder.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

@Injectable()
export class UpsertRecordService {
  private readonly logger = new Logger(UpsertRecordService.name);

  constructor(
    private readonly commonCreateOneRunner: CommonCreateOneQueryRunnerService,
    private readonly commonApiContextBuilder: CommonApiContextBuilder,
  ) {}

  async execute(params: UpsertRecordParams): Promise<ToolOutput> {
    const {
      objectName,
      objectRecord,
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

      // Use Common API's built-in upsert functionality
      // This handles finding existing records by unique fields and updating or inserting
      const result = await this.commonCreateOneRunner.execute(
        { data: objectRecord, selectedFields, upsert: true },
        queryRunnerContext,
      );

      this.logger.log(`Record upserted successfully in ${objectName}`);

      return {
        success: true,
        message: `Record upserted successfully in ${objectName}`,
        result,
      };
    } catch (error) {
      this.logger.error(`Failed to upsert record: ${error}`);

      return {
        success: false,
        message: `Failed to upsert record in ${objectName}`,
        error:
          error instanceof Error ? error.message : 'Failed to upsert record',
      };
    }
  }
}
