import {
  type RemoteReceiver,
  RemoteRootRenderer,
} from '@remote-dom/react/host';
import React, { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FrontComponentWorkerEffect } from '../../remote/components/FrontComponentWorkerEffect';
import { componentRegistry } from '../generated/host-component-registry';

type FrontComponentContentProps = {
  componentUrl: string;
  onError: (error?: Error) => void;
};

export const FrontComponentRenderer = ({
  componentUrl,
  onError,
}: FrontComponentContentProps) => {
  const [receiver, setReceiver] = useState<RemoteReceiver | null>(null);

  return (
    <>
      <FrontComponentWorkerEffect
        componentUrl={componentUrl}
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
