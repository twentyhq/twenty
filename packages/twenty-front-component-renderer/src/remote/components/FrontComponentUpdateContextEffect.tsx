import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';
import { type WorkerExports } from '@/types/WorkerExports';
import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';
import { type ThreadMessagePort } from '@quilted/threads';
import { useEffect } from 'react';

type FrontComponentUpdateContextEffectProps = {
  thread: ThreadMessagePort<WorkerExports, FrontComponentHostCommunicationApi>;
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
