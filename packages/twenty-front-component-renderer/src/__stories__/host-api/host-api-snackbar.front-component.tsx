import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { BUTTON_STYLE } from '@/__stories__/shared/front-components/styles';

const STATUS_STYLE = {
  fontSize: 13,
  color: '#1f2937',
  fontFamily: 'monospace',
};

const HostApiSnackbarFrontComponent = () => {
  const [status, setStatus] = useState('idle');

  const handleClick = async () => {
    try {
      await enqueueSnackbar({
        message: 'Test notification',
        variant: 'success',
      });
      setStatus('snackbar:success');
    } catch (error) {
      setStatus(
        `snackbar:error:${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return (
    <FrontComponentCard title="host-api:snackbar">
      <button
        data-testid="subject"
        type="button"
        onClick={handleClick}
        style={BUTTON_STYLE}
      >
        Snackbar
      </button>
      <span data-testid="api-status" style={STATUS_STYLE}>
        {status}
      </span>
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-host-snackbar-00000000-0000-0000-0000-000000000020',
  name: 'host-api-snackbar-front-component',
  description: 'Front component covering enqueueSnackbar host API',
  component: HostApiSnackbarFrontComponent,
});
