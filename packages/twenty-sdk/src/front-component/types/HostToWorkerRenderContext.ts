import { type FrontComponentExecutionContext } from '@/front-component/types/FrontComponentExecutionContext';

export type HostToWorkerRenderContext = {
  componentUrl: string;
  executionContext: FrontComponentExecutionContext;
};
