import {
  type UiEvent,
  type DevUiState,
  type FileStatus,
  type EntityInfo,
} from '@/cli/utilities/dev/dev-ui-state';
import { SyncableEntity } from 'twenty-shared/application';
import { type DevUiStateManager } from '@/cli/utilities/dev/dev-ui-state-manager';

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const UPLOAD_FRAMES = ['↑', '⇡', '↟', '⤒'];

const STATUS_ICONS: Record<FileStatus, string> = {
  pending: '○',
  building: '◐',
  uploading: '↑',
  success: '✓',
};

const STATUS_COLORS: Record<FileStatus, string> = {
  pending: 'gray',
  building: 'yellow',
  uploading: 'cyan',
  success: 'green',
};

const ENTITY_LABELS: Record<SyncableEntity, string> = {
  [SyncableEntity.Object]: 'Objects',
  [SyncableEntity.ObjectExtension]: 'Object Extensions',
  [SyncableEntity.Function]: 'Functions',
  [SyncableEntity.FrontComponent]: 'Front Components',
  [SyncableEntity.Role]: 'Roles',
};

const ENTITY_ORDER = Object.keys(ENTITY_LABELS) as SyncableEntity[];

const EVENT_COLORS: Record<UiEvent['status'], string> = {
  info: 'gray',
  success: 'green',
  error: 'red',
  warning: 'yellow',
};

const groupEntitiesByType = (
  entities: Map<string, EntityInfo>,
): Map<SyncableEntity, EntityInfo[]> => {
  const grouped = new Map<SyncableEntity, EntityInfo[]>();

  for (const type of ENTITY_ORDER) {
    grouped.set(type, []);
  }

  for (const entity of entities.values()) {
    if (!entity.type) {
      continue;
    }
    const list = grouped.get(entity.type) ?? [];
    list.push(entity);
    grouped.set(entity.type, list);
  }

  return grouped;
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const shortenPath = (path: string, maxLength = 40): string => {
  if (path.length <= maxLength) return path;
  const parts = path.split('/');
  if (parts.length <= 2) return path;
  return `.../${parts.slice(-2).join('/')}`;
};

const getApplicationUrl = (snapshot: DevUiState): string | null => {
  if (!snapshot.frontendUrl || !snapshot.appUniversalIdentifier) {
    return null;
  }
  return `${snapshot.frontendUrl}/settings/applications`;
};

export const renderDevUI = async (
  uiStateManager: DevUiStateManager,
): Promise<{ unmount: () => void }> => {
  const [React, ink] = await Promise.all([import('react'), import('ink')]);

  const { useState, useEffect } = React;
  const { render, Box, Text, Static } = ink;

  const useSpinner = (frames: string[], interval = 80): string => {
    const [frameIndex, setFrameIndex] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setFrameIndex((prev) => (prev + 1) % frames.length);
      }, interval);

      return () => clearInterval(timer);
    }, [frames.length, interval]);

    return frames[frameIndex];
  };

  const EventItem = ({ event }: { event: UiEvent }): React.ReactElement => {
    const color = EVENT_COLORS[event.status];
    const time = formatTime(event.timestamp);

    return (
      <Box>
        <Text dimColor>{time} </Text>
        <Text color={color}>{event.message}</Text>
      </Box>
    );
  };

  const StatusIcon = ({
    status,
  }: {
    status: FileStatus;
  }): React.ReactElement => {
    const buildingFrame = useSpinner(SPINNER_FRAMES, 200);
    const uploadingFrame = useSpinner(UPLOAD_FRAMES, 200);

    const iconByStatus: Record<FileStatus, string> = {
      building: buildingFrame,
      uploading: uploadingFrame,
      pending: STATUS_ICONS.pending,
      success: STATUS_ICONS.success,
    };

    return <Text color={STATUS_COLORS[status]}>{iconByStatus[status]} </Text>;
  };

  const EntityRow = ({
    entity,
  }: {
    entity: EntityInfo;
  }): React.ReactElement => {
    return (
      <Box>
        <StatusIcon status={entity.status} />
        <Text>{entity.name}</Text>
        {entity.path !== entity.name && (
          <Text dimColor> ({shortenPath(entity.path)})</Text>
        )}
      </Box>
    );
  };

  const EntitySection = ({
    type,
    entities,
  }: {
    type: SyncableEntity;
    entities: EntityInfo[];
  }): React.ReactElement | null => {
    if (entities.length === 0) return null;

    return (
      <Box flexDirection="column" marginTop={1}>
        <Text bold dimColor>
          {ENTITY_LABELS[type]}
        </Text>
        {entities.map((entity) => (
          <EntityRow key={entity.path} entity={entity} />
        ))}
      </Box>
    );
  };

  const MANIFEST_STATUS_CONFIG = {
    synced: { color: 'green', icon: '✓', text: 'Synced' },
    building: { color: 'yellow', icon: null, text: 'Building...' },
    syncing: { color: 'yellow', icon: null, text: 'Syncing...' },
    error: { color: 'red', icon: 'x', text: 'Error' },
    idle: { color: 'gray', icon: 'o', text: 'Idle' },
  } as const;

  const UnifiedStatusIndicator = ({
    snapshot,
  }: {
    snapshot: DevUiState;
  }): React.ReactElement => {
    const spinnerFrame = useSpinner(SPINNER_FRAMES, 80);
    const config = MANIFEST_STATUS_CONFIG[snapshot.manifestStatus];
    const icon = config.icon ?? spinnerFrame;

    return (
      <Text color={config.color}>
        {icon} {config.text}
      </Text>
    );
  };

  const ApplicationPanel = ({
    snapshot,
  }: {
    snapshot: DevUiState;
  }): React.ReactElement => {
    const groupedEntities = groupEntitiesByType(snapshot.entities);
    const appUrl = getApplicationUrl(snapshot);

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
            <Text bold>{snapshot.appName ?? 'Loading...'}</Text>
          </Box>
          {snapshot.appDescription && (
            <Box>
              <Text dimColor>Description: </Text>
              <Text>{snapshot.appDescription}</Text>
            </Box>
          )}
          <Box>
            <Text dimColor>Status: </Text>
            <UnifiedStatusIndicator snapshot={snapshot} />
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

        <Box marginLeft={2} flexDirection="column">
          {ENTITY_ORDER.map((type) => {
            const entities = groupedEntities.get(type) ?? [];
            return <EntitySection key={type} type={type} entities={entities} />;
          })}
        </Box>
      </Box>
    );
  };

  const Legend = (): React.ReactElement => (
    <Box marginTop={1}>
      <Text dimColor>
        <Text color={STATUS_COLORS.pending}>{STATUS_ICONS.pending}</Text>{' '}
        pending <Text color={STATUS_COLORS.building}>{SPINNER_FRAMES[0]}</Text>{' '}
        building <Text color={STATUS_COLORS.uploading}>{UPLOAD_FRAMES[0]}</Text>{' '}
        uploading{' '}
        <Text color={STATUS_COLORS.success}>{STATUS_ICONS.success}</Text>{' '}
        success
      </Text>
    </Box>
  );

  const DevUI = (): React.ReactElement => {
    const [snapshot, setSnapshot] = useState<DevUiState>(
      uiStateManager.getSnapshot(),
    );

    useEffect(() => {
      return uiStateManager.subscribe(setSnapshot);
    }, []);

    return (
      <>
        <Static items={snapshot.events}>
          {(event: UiEvent) => <EventItem key={event.id} event={event} />}
        </Static>

        <Box marginTop={1} flexDirection="column">
          <ApplicationPanel snapshot={snapshot} />
          <Legend />
        </Box>
      </>
    );
  };

  const { unmount } = render(<DevUI />);
  return { unmount };
};
