import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

export enum LLMChatModelDriver {
  OPENAI = 'OPENAI',
}

export interface LLMChatModelModuleOptions {
  type: LLMChatModelDriver;
}

export type LLMChatModelModuleAsyncOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => LLMChatModelModuleOptions | undefined;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
