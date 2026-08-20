import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import {
  BUTTON_STYLE,
  STATUS_STYLE,
} from '@/__stories__/shared/front-components/styles';

// Deliberately uses the standard web API rather than the SDK helper: this is
// what a third-party library calls, and it only works if the worker polyfill
// installed navigator.clipboard in the real sandbox realm.
const HostApiNavigatorClipboardFrontComponent = () => {
  const [status, setStatus] = useState('idle');

  const handleClick = async () => {
    try {
      if (typeof navigator.clipboard?.writeText !== 'function') {
        setStatus('clipboard:missing');

        return;
      }

      await navigator.clipboard.writeText('Hello standard clipboard');
      setStatus('clipboard:success');
    } catch (error) {
      setStatus(
        `clipboard:error:${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return (
    <FrontComponentCard title="host-api:navigator-clipboard">
      <button
        data-testid="subject"
        type="button"
        onClick={handleClick}
        style={BUTTON_STYLE}
      >
        Copy
      </button>
      <span data-testid="api-status" style={STATUS_STYLE}>
        {status}
      </span>
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-host-clipboard-00000000-0000-0000-0000-000000000021',
  name: 'host-api-navigator-clipboard-front-component',
  description: 'Front component covering the navigator.clipboard polyfill',
  component: HostApiNavigatorClipboardFrontComponent,
});
