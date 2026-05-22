import { useState } from 'react';
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
  useFrontComponentExecutionContext,
} from 'twenty-sdk/front-component';

import {
  FrontComponentCard,
  UnknownScenario,
} from '../shared/front-components/front-component-card';
import { BUTTON_STYLE } from '../shared/front-components/styles';

const STATUS_STYLE = {
  fontSize: 13,
  color: '#1f2937',
  fontFamily: 'monospace',
};

type HostApiButtonProps = {
  testId: string;
  label: string;
  apiName: string;
  apiCall: () => Promise<void>;
};

const HostApiButton = ({
  testId,
  label,
  apiName,
  apiCall,
}: HostApiButtonProps) => {
  const [status, setStatus] = useState('idle');

  const handleClick = async () => {
    try {
      await apiCall();
      setStatus(`${apiName}:success`);
    } catch (error) {
      setStatus(
        `${apiName}:error:${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return (
    <>
      <button
        data-testid={testId}
        type="button"
        onClick={handleClick}
        style={BUTTON_STYLE}
      >
        {label}
      </button>
      <span data-testid="api-status" style={STATUS_STYLE}>
        {status}
      </span>
    </>
  );
};

const NavigateScenario = () => (
  <HostApiButton
    testId="subject"
    label="Navigate"
    apiName="navigate"
    apiCall={() =>
      navigate(AppPath.RecordIndexPage, { objectNamePlural: 'companies' })
    }
  />
);

const SnackbarScenario = () => (
  <HostApiButton
    testId="subject"
    label="Snackbar"
    apiName="snackbar"
    apiCall={() =>
      enqueueSnackbar({
        message: 'Test notification',
        variant: 'success',
      })
    }
  />
);

const ProgressScenario = () => (
  <HostApiButton
    testId="subject"
    label="Update Progress"
    apiName="progress"
    apiCall={() => updateProgress(50)}
  />
);

const SidePanelOpenScenario = () => (
  <HostApiButton
    testId="subject"
    label="Open Side Panel"
    apiName="sidePanel"
    apiCall={() =>
      openSidePanelPage({
        page: SidePanelPages.ViewRecord,
        pageTitle: 'Test Record',
      })
    }
  />
);

const SidePanelCloseScenario = () => (
  <HostApiButton
    testId="subject"
    label="Close Side Panel"
    apiName="closePanel"
    apiCall={() => closeSidePanel()}
  />
);

const UnmountScenario = () => (
  <HostApiButton
    testId="subject"
    label="Unmount"
    apiName="unmount"
    apiCall={() => unmountFrontComponent()}
  />
);

const SCENARIOS: Record<string, () => JSX.Element> = {
  'host-api:navigate': NavigateScenario,
  'host-api:snackbar': SnackbarScenario,
  'host-api:progress': ProgressScenario,
  'host-api:side-panel:open': SidePanelOpenScenario,
  'host-api:side-panel:close': SidePanelCloseScenario,
  'host-api:unmount': UnmountScenario,
};

const HostApiFrontComponent = () => {
  const scenarioId = useFrontComponentExecutionContext(
    (context) => context.frontComponentId,
  );

  const Scenario = SCENARIOS[scenarioId];

  if (Scenario === undefined) {
    return <UnknownScenario scenarioId={scenarioId} />;
  }

  return (
    <FrontComponentCard scenarioId={scenarioId}>
      <Scenario />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-host-00000000-0000-0000-0000-000000000020',
  name: 'host-api-front-component',
  description: 'Front component covering host communication APIs',
  component: HostApiFrontComponent,
});
