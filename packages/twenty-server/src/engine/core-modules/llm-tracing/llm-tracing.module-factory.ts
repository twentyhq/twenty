import { LLMTracingDriver } from 'src/engine/core-modules/llm-tracing/interfaces/llm-tracing.interface';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

export const llmTracingModuleFactory = (
  environmentService: EnvironmentService,
) => {
  const driver = environmentService.get('LLM_TRACING_DRIVER');

  switch (driver) {
    case LLMTracingDriver.Console: {
      return { type: LLMTracingDriver.Console as const };
    }
    case LLMTracingDriver.Langfuse: {
      const secretKey = environmentService.get('LANGFUSE_SECRET_KEY');
      const publicKey = environmentService.get('LANGFUSE_PUBLIC_KEY');

      if (!(secretKey && publicKey)) {
        throw new Error(
          `${driver} LLM tracing driver requires LANGFUSE_SECRET_KEY and LANGFUSE_PUBLIC_KEY to be defined, check your .env file`,
        );
      }

      return {
        type: LLMTracingDriver.Langfuse as const,
        options: { secretKey, publicKey },
      };
    }
    default:
      throw new Error(
        `Invalid LLM tracing driver (${driver}), check your .env file`,
      );
  }
};
