import { type FrontComponentExecutionContext } from '@/front-component/renderer/types/FrontComponentExecutionContext';
import { type WorkerExports } from '@/front-component/renderer/types/WorkerExports';
import { type ThreadWebWorker } from '@quilted/threads';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type FrontComponentUpdateContextEffectProps = {
  thread: ThreadWebWorker<WorkerExports>;
  executionContext: FrontComponentExecutionContext;
};

export const FrontComponentUpdateContextEffect = ({
  thread,
  executionContext,
}: FrontComponentUpdateContextEffectProps) => {
  useEffect(() => {
    if (isDefined(thread)) {
      thread.imports.updateContext(executionContext).catch(() => {});
    }
  }, [executionContext, thread]);

  return null;
};
