import { Injectable, Logger } from '@nestjs/common';

import { CommonUpdateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-one-query-runner.service';
import { type UpdateRecordParams } from 'src/engine/core-modules/record-crud/types/update-record-params.type';
import { CommonApiContextBuilder } from 'src/engine/core-modules/record-crud/utils/common-api-context-builder.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

@Injectable()
export class UpdateRecordService {
  private readonly logger = new Logger(UpdateRecordService.name);

  constructor(
    private readonly commonUpdateOneRunner: CommonUpdateOneQueryRunnerService,
    private readonly commonApiContextBuilder: CommonApiContextBuilder,
  ) {}

  async execute(params: UpdateRecordParams): Promise<ToolOutput> {
    const {
      objectName,
      objectRecordId,
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

      const result = await this.commonUpdateOneRunner.execute(
        { id: objectRecordId, data: objectRecord, selectedFields },
        queryRunnerContext,
      );

      this.logger.log(`Record updated successfully in ${objectName}`);

      return {
        success: true,
        message: `Record updated successfully in ${objectName}`,
        result,
      };
    } catch (error) {
      this.logger.error(`Failed to update record: ${error}`);

      return {
        success: false,
        message: `Failed to update record in ${objectName}`,
        error:
          error instanceof Error ? error.message : 'Failed to update record',
      };
    }
  }
}
