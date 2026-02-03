import { type FrontComponentExecutionContext } from '@/front-component/types/FrontComponentExecutionContext';
import {
  type RemoteReceiver,
  RemoteRootRenderer,
} from '@remote-dom/react/host';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FrontComponentWorkerEffect } from '../../remote/components/FrontComponentWorkerEffect';
import { componentRegistry } from '../generated/host-component-registry';

type FrontComponentContentProps = {
  componentUrl: string;
  executionContext: FrontComponentExecutionContext;
  onError: (error?: Error) => void;
};

export const FrontComponentRenderer = ({
  componentUrl,
  executionContext,
  onError,
}: FrontComponentContentProps) => {
  const [receiver, setReceiver] = useState<RemoteReceiver | null>(null);

  return (
    <>
      <FrontComponentWorkerEffect
        componentUrl={componentUrl}
        executionContext={executionContext}
        setReceiver={setReceiver}
        onError={onError}
      />

      {isDefined(receiver) && (
        <RemoteRootRenderer
          receiver={receiver}
          components={componentRegistry}
        />
      )}
    </>
  );
};
