import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

import { LangfuseDriverOptions } from 'src/engine/core-modules/llm-tracing/drivers/langfuse.driver';

export enum LLMTracingDriver {
  LANGFUSE = 'LANGFUSE',
  CONSOLE = 'CONSOLE',
}

export interface LangfuseDriverFactoryOptions {
  type: LLMTracingDriver.LANGFUSE;
  options: LangfuseDriverOptions;
}

export interface ConsoleDriverFactoryOptions {
  type: LLMTracingDriver.CONSOLE;
}

export type LLMTracingModuleOptions =
  | LangfuseDriverFactoryOptions
  | ConsoleDriverFactoryOptions;

export type LLMTracingModuleAsyncOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => LLMTracingModuleOptions;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
