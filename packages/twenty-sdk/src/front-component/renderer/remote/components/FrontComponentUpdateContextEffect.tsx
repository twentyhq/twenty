import { type FrontComponentExecutionContext } from '@/front-component/renderer/types/FrontComponentExecutionContext';
import { type WorkerExports } from '@/front-component/renderer/types/WorkerExports';
import { type ThreadWebWorker } from '@quilted/threads';
import { useEffect } from 'react';

type FrontComponentUpdateContextEffectProps = {
  thread: ThreadWebWorker<WorkerExports>;
  executionContext: FrontComponentExecutionContext;
};

export const FrontComponentUpdateContextEffect = ({
  thread,
  executionContext,
}: FrontComponentUpdateContextEffectProps) => {
  useEffect(() => {
    thread.imports.updateContext(executionContext).catch(() => {});
  }, [executionContext, thread]);

  return null;
};
