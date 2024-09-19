import { ModuleMetadata, FactoryProvider } from '@nestjs/common';

import { LangfuseDriverOptions } from 'src/engine/core-modules/llm-tracing/drivers/langfuse.driver';

export enum LLMTracingDriver {
  Langfuse = 'langfuse',
  Console = 'console',
}

export interface LangfuseDriverFactoryOptions {
  type: LLMTracingDriver.Langfuse;
  options: LangfuseDriverOptions;
}

export interface ConsoleDriverFactoryOptions {
  type: LLMTracingDriver.Console;
}

export type LLMTracingModuleOptions =
  | LangfuseDriverFactoryOptions
  | ConsoleDriverFactoryOptions;

export type LLMTracingModuleAsyncOptions = {
  useFactory: (...args: any[]) => LLMTracingModuleOptions;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
