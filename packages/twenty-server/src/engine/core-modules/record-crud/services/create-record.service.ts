import { Injectable, Logger } from '@nestjs/common';

import { CommonCreateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-one-query-runner.service';
import { type CreateRecordParams } from 'src/engine/core-modules/record-crud/types/create-record-params.type';
import { CommonApiContextBuilder } from 'src/engine/core-modules/record-crud/utils/common-api-context-builder.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

@Injectable()
export class CreateRecordService {
  private readonly logger = new Logger(CreateRecordService.name);

  constructor(
    private readonly commonCreateOneRunner: CommonCreateOneQueryRunnerService,
    private readonly commonApiContextBuilder: CommonApiContextBuilder,
  ) {}

  async execute(params: CreateRecordParams): Promise<ToolOutput> {
    const {
      objectName,
      objectRecord,
      workspaceId,
      rolePermissionConfig,
      createdBy,
      userWorkspaceId,
      apiKey,
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

      // Pass createdBy explicitly if provided (for workflows)
      // Common API hook will also inject createdBy from authContext if available
      const dataWithActor = createdBy
        ? { ...objectRecord, createdBy }
        : objectRecord;

      const result = await this.commonCreateOneRunner.execute(
        { data: dataWithActor, selectedFields },
        queryRunnerContext,
      );

      this.logger.log(`Record created successfully in ${objectName}`);

      return {
        success: true,
        message: `Record created successfully in ${objectName}`,
        result,
      };
    } catch (error) {
      this.logger.error(`Failed to create record: ${error}`);

      return {
        success: false,
        message: `Failed to create record in ${objectName}`,
        error:
          error instanceof Error ? error.message : 'Failed to create record',
      };
    }
  }
}
