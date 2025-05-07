import { LLMTracingDriver } from 'src/engine/core-modules/llm-tracing/interfaces/llm-tracing.interface';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export const llmTracingModuleFactory = (
  twentyConfigService: TwentyConfigService,
) => {
  const driver = twentyConfigService.get('LLM_TRACING_DRIVER');

  switch (driver) {
    case LLMTracingDriver.Console: {
      return { type: LLMTracingDriver.Console as const };
    }
    case LLMTracingDriver.Langfuse: {
      const secretKey = twentyConfigService.get('LANGFUSE_SECRET_KEY');
      const publicKey = twentyConfigService.get('LANGFUSE_PUBLIC_KEY');

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
