import { ModuleMetadata, FactoryProvider } from '@nestjs/common';

import { LLMPromptTemplateEnvVar } from 'src/engine/integrations/llm-prompt-template/interfaces/llm-prompt-template-name.interface';

interface AskAIPromptTemplateInput {
  schema: string;
  question: string;
}

export type PromptTemplateInput<T> = T extends LLMPromptTemplateEnvVar.AskAI
  ? AskAIPromptTemplateInput
  : never;

export enum LLMPromptTemplateDriver {
  Langfuse = 'langfuse',
  File = 'file',
}

export interface LLMPromptTemplateModuleOptions {
  type: LLMPromptTemplateDriver;
}

export type LLMPromptTemplateModuleAsyncOptions = {
  useFactory: (...args: any[]) => LLMPromptTemplateModuleOptions;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
