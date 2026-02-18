import {
  type OrchestratorStateEntityInfo,
} from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import {
  type DevUiStatus,
  DEV_UI_STATUS_CONFIG,
  ENTITY_LABELS,
  ENTITY_ORDER,
  SPINNER_FRAMES,
  UPLOAD_FRAMES,
  mapFileStatusToDevUiStatus,
  shortenPath,
} from '@/cli/utilities/dev/ui/dev-ui-constants';
import { useStatusIcon } from '@/cli/utilities/dev/ui/dev-ui-hooks';
import { useInk } from '@/cli/utilities/dev/ui/dev-ui-ink-context';
import React from 'react';
import { type SyncableEntity } from 'twenty-shared/application';

export const DevUiStatusIcon = ({
  uiStatus,
}: {
  uiStatus: DevUiStatus;
}): React.ReactElement => {
  const { Text } = useInk();
  const icon = useStatusIcon(uiStatus);
  const config = DEV_UI_STATUS_CONFIG[uiStatus];

  return <Text color={config.color}>{icon} </Text>;
};

export const DevUiEntityRow = ({
  entity,
}: {
  entity: OrchestratorStateEntityInfo;
}): React.ReactElement => {
  const { Box, Text } = useInk();

  return (
    <Box>
      <DevUiStatusIcon
        uiStatus={mapFileStatusToDevUiStatus(entity.status)}
      />
      <Text>{entity.name}</Text>
      {entity.path !== entity.name && (
        <Text dimColor> ({shortenPath(entity.path)})</Text>
      )}
    </Box>
  );
};

export const DevUiEntitySection = ({
  type,
  entities,
}: {
  type: SyncableEntity;
  entities: OrchestratorStateEntityInfo[];
}): React.ReactElement | null => {
  const { Box, Text } = useInk();

  if (entities.length === 0) return null;

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold dimColor>
        {ENTITY_LABELS[type]}
      </Text>
      {entities.map((entity) => (
        <DevUiEntityRow key={entity.path} entity={entity} />
      ))}
    </Box>
  );
};

export const DevUiEntityLegend = (): React.ReactElement => {
  const { Box, Text } = useInk();

  return (
    <Box marginTop={1}>
      <Text dimColor>
        <Text color={DEV_UI_STATUS_CONFIG.idle.color}>
          {DEV_UI_STATUS_CONFIG.idle.icon}
        </Text>{' '}
        pending{' '}
        <Text color={DEV_UI_STATUS_CONFIG.in_progress.color}>
          {SPINNER_FRAMES[0]}
        </Text>{' '}
        building{' '}
        <Text color={DEV_UI_STATUS_CONFIG.uploading.color}>
          {UPLOAD_FRAMES[0]}
        </Text>{' '}
        uploading{' '}
        <Text color={DEV_UI_STATUS_CONFIG.done.color}>
          {DEV_UI_STATUS_CONFIG.done.icon}
        </Text>{' '}
        success
      </Text>
    </Box>
  );
};

export { ENTITY_ORDER };
