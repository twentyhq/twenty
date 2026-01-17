import { Inject, Injectable, Optional } from '@nestjs/common';

import { type ExceptionHandlerOptions } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-options.interface';

import { ExceptionHandlerDriverInterface } from 'src/engine/core-modules/exception-handler/interfaces';
import { EXCEPTION_HANDLER_DRIVER } from 'src/engine/core-modules/exception-handler/exception-handler.constants';
import { AILayerService } from 'src/engine/core-modules/ai-layer/ai-layer.service';

@Injectable()
export class ExceptionHandlerService {
  constructor(
    @Inject(EXCEPTION_HANDLER_DRIVER)
    private driver: ExceptionHandlerDriverInterface,
    @Optional()
    private aiLayerService?: AILayerService,
  ) {}

  captureExceptions(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exceptions: ReadonlyArray<any>,
    options?: ExceptionHandlerOptions,
  ): string[] {
    const result = this.driver.captureExceptions(exceptions, options);

    // Report to AI Layer if service is available
    if (this.aiLayerService) {
      this.reportToAILayer(exceptions, options);
    }

    return result;
  }

  private reportToAILayer(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exceptions: ReadonlyArray<any>,
    options?: ExceptionHandlerOptions,
  ): void {
    for (const exception of exceptions) {
      const errorReport = {
        workspace_id: options?.workspace?.id ?? 'unknown',
        profile_id: options?.user?.id ?? 'system',
        error_type: exception?.name ?? 'UnknownError',
        error_message: exception?.message ?? String(exception),
        error_stack: exception?.stack,
        execution_id: options?.additionalData?.requestId as string | undefined,
        metadata: {
          source: 'twenty-crm',
          timestamp: new Date().toISOString(),
          operation: options?.operation,
        },
        criticality: 'error' as const,
      };

      // Fire and forget - don't block exception handling
      this.aiLayerService?.reportError(errorReport).catch(() => {
        // Silently ignore AI Layer reporting failures
      });
    }
  }
}
