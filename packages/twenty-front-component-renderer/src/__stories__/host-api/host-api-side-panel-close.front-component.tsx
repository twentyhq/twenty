import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { closeSidePanel } from 'twenty-sdk/front-component';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { BUTTON_STYLE } from '@/__stories__/shared/front-components/styles';

const STATUS_STYLE = {
  fontSize: 13,
  color: '#1f2937',
  fontFamily: 'monospace',
};

const HostApiSidePanelCloseFrontComponent = () => {
  const [status, setStatus] = useState('idle');

  const handleClick = async () => {
    try {
      await closeSidePanel();
      setStatus('closePanel:success');
    } catch (error) {
      setStatus(
        `closePanel:error:${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return (
    <FrontComponentCard title="host-api:side-panel:close">
      <button
        data-testid="subject"
        type="button"
        onClick={handleClick}
        style={BUTTON_STYLE}
      >
        Close Side Panel
      </button>
      <span data-testid="api-status" style={STATUS_STYLE}>
        {status}
      </span>
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-host-spc-00000000-0000-0000-0000-000000000020',
  name: 'host-api-side-panel-close-front-component',
  description: 'Front component covering closeSidePanel host API',
  component: HostApiSidePanelCloseFrontComponent,
});
