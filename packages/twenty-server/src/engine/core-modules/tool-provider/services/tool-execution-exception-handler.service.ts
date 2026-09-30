import { Injectable } from '@nestjs/common';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { formatValidationErrors } from 'src/engine/core-modules/tool-provider/utils/format-validation-errors.util';
import { isToolExecutionRefusal } from 'src/engine/core-modules/tool-provider/utils/is-tool-execution-refusal.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { shouldCaptureException } from 'src/engine/utils/global-exception-handler.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

@Injectable()
export class ToolExecutionExceptionHandlerService {
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  handleToolExecutionException({
    error,
    toolName,
    workspaceId,
  }: {
    error: unknown;
    toolName: string;
    workspaceId: string;
  }): ToolOutput {
    if (
      error instanceof Error &&
      !isToolExecutionRefusal(error) &&
      shouldCaptureException(error)
    ) {
      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: workspaceId },
        additionalData: { toolName },
      });
    }

    return {
      success: false,
      message: `Failed to execute ${toolName}`,
      error: this.getToolErrorMessage(error),
    };
  }

  private getToolErrorMessage(error: unknown): string {
    if (error instanceof WorkspaceMigrationBuilderException) {
      return formatValidationErrors(error);
    }

    return error instanceof Error ? error.message : String(error);
  }
}
