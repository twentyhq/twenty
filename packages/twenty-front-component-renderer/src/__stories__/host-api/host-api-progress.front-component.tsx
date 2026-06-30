import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { updateProgress } from 'twenty-sdk/front-component';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { BUTTON_STYLE } from '@/__stories__/shared/front-components/styles';

const STATUS_STYLE = {
  fontSize: 13,
  color: '#1f2937',
  fontFamily: 'monospace',
};

const HostApiProgressFrontComponent = () => {
  const [status, setStatus] = useState('idle');

  const handleClick = async () => {
    try {
      await updateProgress(50);
      setStatus('progress:success');
    } catch (error) {
      setStatus(
        `progress:error:${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return (
    <FrontComponentCard title="host-api:progress">
      <button
        data-testid="subject"
        type="button"
        onClick={handleClick}
        style={BUTTON_STYLE}
      >
        Update Progress
      </button>
      <span data-testid="api-status" style={STATUS_STYLE}>
        {status}
      </span>
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-host-progress-00000000-0000-0000-0000-000000000020',
  name: 'host-api-progress-front-component',
  description: 'Front component covering updateProgress host API',
  component: HostApiProgressFrontComponent,
});
