import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { unmountFrontComponent } from 'twenty-sdk/front-component';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { BUTTON_STYLE } from '@/__stories__/shared/front-components/styles';

const STATUS_STYLE = {
  fontSize: 13,
  color: '#1f2937',
  fontFamily: 'monospace',
};

const HostApiUnmountFrontComponent = () => {
  const [status, setStatus] = useState('idle');

  const handleClick = async () => {
    try {
      await unmountFrontComponent();
      setStatus('unmount:success');
    } catch (error) {
      setStatus(
        `unmount:error:${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return (
    <FrontComponentCard title="host-api:unmount">
      <button
        data-testid="subject"
        type="button"
        onClick={handleClick}
        style={BUTTON_STYLE}
      >
        Unmount
      </button>
      <span data-testid="api-status" style={STATUS_STYLE}>
        {status}
      </span>
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-host-unmount-00000000-0000-0000-0000-000000000020',
  name: 'host-api-unmount-front-component',
  description: 'Front component covering unmountFrontComponent host API',
  component: HostApiUnmountFrontComponent,
});
