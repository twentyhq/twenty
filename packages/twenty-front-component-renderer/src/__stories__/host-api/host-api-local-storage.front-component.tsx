import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { localStorage } from 'twenty-sdk/front-component';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { BUTTON_STYLE } from '@/__stories__/shared/front-components/styles';

const STATUS_STYLE = {
  fontSize: 13,
  color: '#1f2937',
  fontFamily: 'monospace',
};

const OVERSIZED_VALUE = 'x'.repeat(300 * 1024);

const getErrorCode = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const { code } = error as { code?: unknown };

    if (typeof code === 'string') {
      return code;
    }
  }

  return String(error);
};

const HostApiLocalStorageFrontComponent = () => {
  const [status, setStatus] = useState('idle');

  const runRoundTrip = async () => {
    try {
      await localStorage.set('greeting', { hello: 'world' });

      const storedValue = await localStorage.get<{ hello: string }>('greeting');
      const storedKeys = await localStorage.keys();
      const wasDeleted = await localStorage.delete('greeting');

      setStatus(
        `storage:success:${storedValue?.hello}:${storedKeys.join(',')}:${wasDeleted}`,
      );
    } catch (error) {
      setStatus(`storage:error:${getErrorCode(error)}`);
    }
  };

  const runGlobalStorageWrite = async () => {
    try {
      window.localStorage.setItem('from-dependency', '"raw"');

      const storedValue = await localStorage.get<string>('from-dependency');

      setStatus(`storage:shared:${storedValue}`);
    } catch (error) {
      setStatus(`storage:error:${getErrorCode(error)}`);
    }
  };

  const runRawDependencyRead = async () => {
    try {
      window.localStorage.setItem('raw-dependency', 'plain text');

      const storedValue = await localStorage.get<string>('raw-dependency');

      setStatus(`storage:raw:${storedValue}`);
    } catch (error) {
      setStatus(`storage:error:${getErrorCode(error)}`);
    }
  };

  const runOversizedWrite = async () => {
    try {
      await localStorage.set('oversized', OVERSIZED_VALUE);

      setStatus('storage:success:oversized');
    } catch (error) {
      setStatus(`storage:error:${getErrorCode(error)}`);
    }
  };

  return (
    <FrontComponentCard title="host-api:local-storage">
      <button
        data-testid="subject"
        type="button"
        onClick={runRoundTrip}
        style={BUTTON_STYLE}
      >
        Round trip
      </button>
      <button
        data-testid="global-storage"
        type="button"
        onClick={runGlobalStorageWrite}
        style={BUTTON_STYLE}
      >
        Write through window.localStorage
      </button>
      <button
        data-testid="raw-dependency"
        type="button"
        onClick={runRawDependencyRead}
        style={BUTTON_STYLE}
      >
        Read a raw dependency value
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
  name: 'host-api-local-storage-front-component',
  description: 'Front component covering the localStorage host API',
  component: HostApiLocalStorageFrontComponent,
});
