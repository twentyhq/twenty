import {
  type RemoteReceiver,
  RemoteRootRenderer,
} from '@remote-dom/react/host';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { ThemeProvider } from '@emotion/react';
import { type ThemeType } from 'twenty-ui/theme';
import { FrontComponentWorkerEffect } from '../../remote/components/FrontComponentWorkerEffect';
import { componentRegistry } from '../generated/host-component-registry';

type FrontComponentContentProps = {
  componentUrl: string;
  onError: (error?: Error) => void;
  theme: ThemeType;
};

export const FrontComponentRenderer = ({
  componentUrl,
  onError,
  theme,
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
