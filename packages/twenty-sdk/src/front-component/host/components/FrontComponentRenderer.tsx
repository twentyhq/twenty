import { FrontComponentErrorEffect } from '@/front-component/remote/components/FrontComponentErrorEffect';
import { FrontComponentUpdateContextEffect } from '@/front-component/remote/components/FrontComponentUpdateContextEffect';
import { type FrontComponentExecutionContext } from '@/front-component/types/FrontComponentExecutionContext';
import { type WorkerExports } from '@/front-component/types/WorkerExports';
import { type ThreadWebWorker } from '@quilted/threads';
import {
  type RemoteReceiver,
  RemoteRootRenderer,
} from '@remote-dom/react/host';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { ThemeProvider } from '@emotion/react';
import { type ThemeType } from 'twenty-ui/theme';
import { FrontComponentWorkerEffect } from '../../remote/components/FrontComponentWorkerEffect';
import { componentRegistry } from '../generated/host-component-registry';

type FrontComponentContentProps = {
  componentUrl: string;
  executionContext: FrontComponentExecutionContext;
  onError: (error?: Error) => void;
  theme: ThemeType;
};

export const FrontComponentRenderer = ({
  componentUrl,
  executionContext,
  onError,
  theme,
}: FrontComponentContentProps) => {
  const [receiver, setReceiver] = useState<RemoteReceiver | null>(null);
  const [thread, setThread] = useState<ThreadWebWorker<WorkerExports> | null>(
    null,
  );
  const [error, setError] = useState<Error | null>(null);

  const MemoizedFrontComponentWorkerEffect = useMemo(() => {
    return (
      <FrontComponentWorkerEffect
        componentUrl={componentUrl}
        setReceiver={setReceiver}
        setThread={setThread}
        setError={setError}
      />
    );
  }, [componentUrl, setError, setReceiver, setThread]);

  return (
    <>
      {MemoizedFrontComponentWorkerEffect}

      {isDefined(error) && (
        <FrontComponentErrorEffect error={error} onError={onError} />
      )}

      {isDefined(thread) && (
        <FrontComponentUpdateContextEffect
          thread={thread}
          executionContext={executionContext}
        />
      )}

      {isDefined(receiver) && (
        <ThemeProvider theme={theme}>
          <RemoteRootRenderer
            receiver={receiver}
            components={componentRegistry}
          />
        </ThemeProvider>
      )}
    </>
  );
};
