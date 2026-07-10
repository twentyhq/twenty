import { type FrontComponentThread } from '@/types/FrontComponentThread';
import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';
import { useEffect } from 'react';

type FrontComponentUpdateContextEffectProps = {
  thread: FrontComponentThread;
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
