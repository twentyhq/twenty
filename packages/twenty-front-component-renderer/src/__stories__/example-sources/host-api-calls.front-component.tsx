import { defineFrontComponent } from 'twenty-sdk/define';
import {
  AppPath,
  closeSidePanel,
  enqueueSnackbar,
  navigate,
  openSidePanelPage,
  SidePanelPages,
  unmountFrontComponent,
  updateProgress,
} from 'twenty-sdk/front-component';
import { useState } from 'react';

const CARD_STYLE = {
  padding: 24,
  backgroundColor: '#faf5ff',
  border: '2px solid #a78bfa',
  borderRadius: 12,
  fontFamily: 'system-ui, sans-serif',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 10,
  maxWidth: 400,
};

const HEADING_STYLE = {
  color: '#5b21b6',
  fontWeight: 700,
  fontSize: 18,
  margin: 0,
};

const BUTTON_STYLE = {
  padding: '8px 16px',
  backgroundColor: '#7c3aed',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 13,
};

const STATUS_STYLE = {
  fontSize: 13,
  color: '#6b7280',
  fontFamily: 'monospace',
};

const HostApiCallsComponent = () => {
  const [apiStatus, setApiStatus] = useState('idle');

  const callApi = async (name: string, apiFunction: () => Promise<void>) => {
    try {
      await apiFunction();
      setApiStatus(`${name}:success`);
    } catch (error) {
      setApiStatus(
        `${name}:error:${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return (
    <div data-testid="host-api-calls-component" style={CARD_STYLE}>
      <h2 style={HEADING_STYLE}>Host API Calls</h2>

      <button
        data-testid="btn-navigate"
        type="button"
        onClick={() =>
          callApi('navigate', () =>
            navigate(AppPath.RecordIndexPage, {
              objectNamePlural: 'companies',
            }),
          )
        }
        style={BUTTON_STYLE}
      >
        Navigate
      </button>

      <button
        data-testid="btn-snackbar"
        type="button"
        onClick={() =>
          callApi('snackbar', () =>
            enqueueSnackbar({
              message: 'Test notification',
              variant: 'success',
            }),
          )
        }
        style={BUTTON_STYLE}
      >
        Snackbar
      </button>

      <button
        data-testid="btn-side-panel"
        type="button"
        onClick={() =>
          callApi('sidePanel', () =>
            openSidePanelPage({
              page: SidePanelPages.ViewRecord,
              pageTitle: 'Test Record',
            }),
          )
        }
        style={BUTTON_STYLE}
      >
        Open Side Panel
      </button>

      <button
        data-testid="btn-close-panel"
        type="button"
        onClick={() => callApi('closePanel', () => closeSidePanel())}
        style={BUTTON_STYLE}
      >
        Close Side Panel
      </button>

      <button
        data-testid="btn-unmount"
        type="button"
        onClick={() => callApi('unmount', () => unmountFrontComponent())}
        style={BUTTON_STYLE}
      >
        Unmount
      </button>

      <button
        data-testid="btn-progress"
        type="button"
        onClick={() => callApi('progress', () => updateProgress(50))}
        style={BUTTON_STYLE}
      >
        Update Progress (50)
      </button>

      <span data-testid="api-status" style={STATUS_STYLE}>
        {apiStatus}
      </span>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-hapi-00000000-0000-0000-0000-000000000022',
  name: 'host-api-calls-component',
  description:
    'Component testing host communication API calls (navigate, snackbar, side panel, etc.)',
  component: HostApiCallsComponent,
});
