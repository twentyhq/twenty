import { Injectable, Logger } from '@nestjs/common';

import { CommonDeleteOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-delete-one-query-runner.service';
import { type DeleteRecordParams } from 'src/engine/core-modules/record-crud/types/delete-record-params.type';
import { CommonApiContextBuilder } from 'src/engine/core-modules/record-crud/utils/common-api-context-builder.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

@Injectable()
export class DeleteRecordService {
  private readonly logger = new Logger(DeleteRecordService.name);

  constructor(
    private readonly commonDeleteOneRunner: CommonDeleteOneQueryRunnerService,
    private readonly commonApiContextBuilder: CommonApiContextBuilder,
  ) {}

  async execute(params: DeleteRecordParams): Promise<ToolOutput> {
    const {
      objectName,
      objectRecordId,
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

      const result = await this.commonDeleteOneRunner.execute(
        { id: objectRecordId, selectedFields },
        queryRunnerContext,
      );

      this.logger.log(`Record deleted successfully in ${objectName}`);

      return {
        success: true,
        message: `Record deleted successfully in ${objectName}`,
        result,
      };
    } catch (error) {
      this.logger.error(`Failed to delete record: ${error}`);

      return {
        success: false,
        message: `Failed to delete record in ${objectName}`,
        error:
          error instanceof Error ? error.message : 'Failed to delete record',
      };
    }
  }
}
