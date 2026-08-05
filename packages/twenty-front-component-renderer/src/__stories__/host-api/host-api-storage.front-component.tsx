import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { BUTTON_STYLE } from '@/__stories__/shared/front-components/styles';

const STATUS_STYLE = {
  fontSize: 13,
  color: '#1f2937',
  fontFamily: 'monospace',
};

const OVERSIZED_VALUE = 'x'.repeat(300 * 1024);

const getErrorName = (error: unknown): string =>
  error instanceof Error ? error.name : String(error);

const HostApiStorageFrontComponent = () => {
  const [status, setStatus] = useState('idle');

  const runLocalStorageRoundTrip = () => {
    try {
      window.localStorage.setItem('greeting', 'hello');

      const storedValue = window.localStorage.getItem('greeting');
      const storedKey = window.localStorage.key(0);
      const storedLength = window.localStorage.length;

      window.localStorage.removeItem('greeting');

      setStatus(
        `storage:local:${storedValue}:${storedKey}:${storedLength}:${window.localStorage.length}`,
      );
    } catch (error) {
      setStatus(`storage:error:${getErrorName(error)}`);
    }
  };

  const runSessionStorageRoundTrip = () => {
    try {
      window.sessionStorage.setItem('visits', '2');

      setStatus(`storage:session:${window.sessionStorage.getItem('visits')}`);
    } catch (error) {
      setStatus(`storage:error:${getErrorName(error)}`);
    }
  };

  const runOversizedWrite = () => {
    try {
      window.localStorage.setItem('oversized', OVERSIZED_VALUE);

      setStatus('storage:local:oversized');
    } catch (error) {
      setStatus(`storage:error:${getErrorName(error)}`);
    }
  };

  return (
    <FrontComponentCard title="host-api:storage">
      <button
        data-testid="subject"
        type="button"
        onClick={runLocalStorageRoundTrip}
        style={BUTTON_STYLE}
      >
        Local storage round trip
      </button>
      <button
        data-testid="session-storage"
        type="button"
        onClick={runSessionStorageRoundTrip}
        style={BUTTON_STYLE}
      >
        Session storage round trip
      </button>
      <button
        data-testid="oversized"
        type="button"
        onClick={runOversizedWrite}
        style={BUTTON_STYLE}
      >
        Write oversized value
      </button>
      <span data-testid="api-status" style={STATUS_STYLE}>
        {status}
      </span>
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-host-storage-00000000-0000-0000-0000-000000000021',
  name: 'host-api-storage-front-component',
  description: 'Front component covering the window storage shims',
  component: HostApiStorageFrontComponent,
});
