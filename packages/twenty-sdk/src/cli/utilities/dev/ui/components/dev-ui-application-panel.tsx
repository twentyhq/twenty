import {
  type OrchestratorState,
  type OrchestratorStateStepStatus,
} from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import {
  DEV_UI_STATUS_CONFIG,
  SYNC_STATUS_LABELS,
  getApplicationUrl,
  getPipelineRows,
  groupEntitiesByType,
  mapStepStatusToDevUiStatus,
  mapSyncStatusToDevUiStatus,
} from '@/cli/utilities/dev/ui/dev-ui-constants';
import { useStatusIcon } from '@/cli/utilities/dev/ui/dev-ui-hooks';
import { useInk } from '@/cli/utilities/dev/ui/dev-ui-ink-context';
import {
  DevUiEntitySection,
  ENTITY_ORDER,
} from '@/cli/utilities/dev/ui/components/dev-ui-entity-section';
import React from 'react';

export const DevUiSyncStatusIndicator = ({
  state,
}: {
  state: OrchestratorState;
}): React.ReactElement => {
  const { Text } = useInk();
  const uiStatus = mapSyncStatusToDevUiStatus(state.pipeline.status);
  const icon = useStatusIcon(uiStatus);
  const config = DEV_UI_STATUS_CONFIG[uiStatus];
  const label = SYNC_STATUS_LABELS[state.pipeline.status];

  return (
    <Text color={config.color}>
      {icon} {label}
      {state.pipeline.error && `: ${state.pipeline.error}`}
    </Text>
  );
};

export const DevUiStepStatusLabel = ({
  label,
  status,
}: {
  label: string;
  status: OrchestratorStateStepStatus;
}): React.ReactElement => {
  const { Box, Text } = useInk();
  const uiStatus = mapStepStatusToDevUiStatus(status);
  const icon = useStatusIcon(uiStatus);
  const config = DEV_UI_STATUS_CONFIG[uiStatus];

  return (
    <Box>
      <Text dimColor>{label}: </Text>
      <Text color={config.color}>
        {icon} {status.replace('_', ' ')}
      </Text>
    </Box>
  );
};

export const DevUiApplicationPanel = ({
  state,
}: {
  state: OrchestratorState;
}): React.ReactElement => {
  const { Box, Text } = useInk();
  const groupedEntities = groupEntitiesByType(state.entities);
  const appUrl = getApplicationUrl(state);

  return (
    <Box
      flexDirection="column"
      borderStyle="classic"
      borderColor="gray"
      paddingX={1}
    >
      <Text bold color="cyan">
        Application
      </Text>
      <Box marginLeft={2} flexDirection="column">
        <Box>
          <Text dimColor>Name: </Text>
          <Text bold>{state.pipeline.appName ?? 'Loading...'}</Text>
        </Box>
        <Box>
          <Text dimColor>Overall Status: </Text>
          <DevUiSyncStatusIndicator state={state} />
        </Box>
        {appUrl && (
          <Box>
            <Text dimColor>Open:</Text>
            <Text bold color="cyan">
              {' '}
              {appUrl}
            </Text>
          </Box>
        )}
      </Box>

      <Box marginLeft={2} flexDirection="column" marginTop={1}>
        {getPipelineRows(state).map((row) => (
          <DevUiStepStatusLabel
            key={row.label}
            label={row.label}
            status={row.status}
          />
        ))}
      </Box>

      <Box marginLeft={2} flexDirection="column">
        {ENTITY_ORDER.map((type) => {
          const entities = groupedEntities.get(type) ?? [];

          return (
            <DevUiEntitySection
              key={type}
              type={type}
              entities={entities}
            />
          );
        })}
      </Box>
    </Box>
  );
};
