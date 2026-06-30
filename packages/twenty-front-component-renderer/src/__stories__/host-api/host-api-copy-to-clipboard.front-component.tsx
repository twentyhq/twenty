import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { copyToClipboard } from 'twenty-sdk/front-component';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { BUTTON_STYLE } from '@/__stories__/shared/front-components/styles';

const STATUS_STYLE = {
  fontSize: 13,
  color: '#1f2937',
  fontFamily: 'monospace',
};

const HostApiCopyToClipboardFrontComponent = () => {
  const [status, setStatus] = useState('idle');

  const handleClick = async () => {
    try {
      await copyToClipboard('Hello clipboard');
      setStatus('clipboard:success');
    } catch (error) {
      setStatus(
        `clipboard:error:${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return (
    <FrontComponentCard title="host-api:copy-to-clipboard">
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
  universalIdentifier: 'fc-host-clipboard-00000000-0000-0000-0000-000000000020',
  name: 'host-api-copy-to-clipboard-front-component',
  description: 'Front component covering copyToClipboard host API',
  component: HostApiCopyToClipboardFrontComponent,
});
