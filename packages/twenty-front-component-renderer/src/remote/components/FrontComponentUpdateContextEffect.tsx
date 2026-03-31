import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';
import { type WorkerExports } from '@/types/WorkerExports';
import { type FrontComponentExecutionContext } from 'twenty-sdk';
import { type ThreadWebWorker } from '@quilted/threads';
import { useEffect } from 'react';

type FrontComponentUpdateContextEffectProps = {
  thread: ThreadWebWorker<WorkerExports, FrontComponentHostCommunicationApi>;
  executionContext: FrontComponentExecutionContext;
  onExecutionContextInitialized: () => void;
};

export const FrontComponentUpdateContextEffect = ({
  thread,
  executionContext,
  onExecutionContextInitialized,
}: FrontComponentUpdateContextEffectProps) => {
  useEffect(() => {
    const updateContext = async () => {
      await thread.imports.updateContext(executionContext).catch(() => {});
      onExecutionContextInitialized();
    };

    updateContext();
  }, [executionContext, onExecutionContextInitialized, thread]);

  return null;
};
