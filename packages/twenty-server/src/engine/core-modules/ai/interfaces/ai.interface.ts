import { InjectionToken, OptionalFactoryDependency } from '@nestjs/common';

export enum AiDriver {
  OPENAI = 'openai',
}

export interface AiModuleOptions {
  type: AiDriver;
}

export type AiModuleAsyncOptions = {
  inject?: (InjectionToken | OptionalFactoryDependency)[];
  useFactory: (...args: unknown[]) => AiModuleOptions | undefined;
};
