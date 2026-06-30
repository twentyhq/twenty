import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { openSidePanelPage, SidePanelPages } from 'twenty-sdk/front-component';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { BUTTON_STYLE } from '@/__stories__/shared/front-components/styles';

const STATUS_STYLE = {
  fontSize: 13,
  color: '#1f2937',
  fontFamily: 'monospace',
};

const HostApiSidePanelOpenFrontComponent = () => {
  const [status, setStatus] = useState('idle');

  const handleClick = async () => {
    try {
      await openSidePanelPage({
        page: SidePanelPages.ViewRecord,
        recordId: 'test-record-id',
        objectNameSingular: 'company',
      });
      setStatus('sidePanel:success');
    } catch (error) {
      setStatus(
        `sidePanel:error:${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return (
    <FrontComponentCard title="host-api:side-panel:open">
      <button
        data-testid="subject"
        type="button"
        onClick={handleClick}
        style={BUTTON_STYLE}
      >
        Open Side Panel
      </button>
      <span data-testid="api-status" style={STATUS_STYLE}>
        {status}
      </span>
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-host-spo-00000000-0000-0000-0000-000000000020',
  name: 'host-api-side-panel-open-front-component',
  description: 'Front component covering openSidePanelPage host API',
  component: HostApiSidePanelOpenFrontComponent,
});
