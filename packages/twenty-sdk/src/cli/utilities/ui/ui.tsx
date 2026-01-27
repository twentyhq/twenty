import {
  type UiEvent,
  type UiState,
  type FileStatus,
  type EntityInfo,
} from '@/cli/utilities/ui/ui-state';
import { SyncableEntities } from 'twenty-shared/application';
import { type UiStateManager } from '@/cli/utilities/ui/ui-state-manager';

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const UPLOAD_FRAMES = ['↑', '⇡', '↟', '⤒'];

const STATUS_ICONS: Record<FileStatus, string> = {
  pending: '○',
  building: '◐',
  built: '●',
  uploading: '↑',
  uploaded: '✓',
};

const STATUS_COLORS: Record<FileStatus, string> = {
  pending: 'gray',
  building: 'yellow',
  built: 'blue',
  uploading: 'cyan',
  uploaded: 'green',
};

const ENTITY_LABELS: Record<SyncableEntities, string> = {
  [SyncableEntities.Object]: 'Objects',
  [SyncableEntities.ObjectExtension]: 'Object Extensions',
  [SyncableEntities.Function]: 'Functions',
  [SyncableEntities.FrontComponent]: 'Front Components',
  [SyncableEntities.Role]: 'Roles',
};

const ENTITY_ORDER = Object.keys(ENTITY_LABELS) as SyncableEntities[];

const EVENT_COLORS: Record<UiEvent['status'], string> = {
  info: 'gray',
  success: 'green',
  error: 'red',
  warning: 'yellow',
};
/*
const EVENT_ICONS: Record<UiEvent['type'], string> = {
  'file-change': '→',
  'manifest-build': '◆',
  'file-build': '●',
  'file-upload': '☁',
  sync: '↻',
};*/

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

const getApplicationUrl = (snapshot: UiState): string | null => {
  if (!snapshot.frontendUrl || !snapshot.appUniversalIdentifier) {
    return null;
  }
  return `${snapshot.frontendUrl}/settings/applications`;
};

export const renderUI = async (
  uiStateManager: UiStateManager,
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
        {/*<Text color={color}>{icon} </Text>*/}
        <Text color={color}>{event.message}</Text>
      </Box>
    );
  };

  const StatusIcon = ({
    status,
  }: {
    status: FileStatus;
  }): React.ReactElement => {
    const buildingFrame = useSpinner(SPINNER_FRAMES, 80);
    const uploadingFrame = useSpinner(UPLOAD_FRAMES, 150);

    let icon: string;
    if (status === 'building') {
      icon = buildingFrame;
    } else if (status === 'uploading') {
      icon = uploadingFrame;
    } else {
      icon = STATUS_ICONS[status];
    }

    return <Text color={STATUS_COLORS[status]}>{icon} </Text>;
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
        <Text dimColor> ({shortenPath(entity.path)})</Text>
      </Box>
    );
  };

  const EntitySection = ({
    type,
    entities,
  }: {
    type: SyncableEntities;
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

  const UnifiedStatusIndicator = ({
    snapshot,
  }: {
    snapshot: UiState;
  }): React.ReactElement => {
    const spinnerFrame = useSpinner(SPINNER_FRAMES, 80);
    const status = snapshot.manifestStatus;

    const color =
      status === 'synced'
        ? 'green'
        : status === 'built'
          ? 'blue'
          : status === 'building' || status === 'syncing'
            ? 'yellow'
            : status === 'error'
              ? 'red'
              : 'gray';

    let icon: string;
    let text: string;
    if (status === 'synced') {
      icon = '+';
      text = 'Synced';
    } else if (status === 'built') {
      icon = '*';
      text = 'Built';
    } else if (status === 'building') {
      icon = spinnerFrame;
      text = 'Building...';
    } else if (status === 'syncing') {
      icon = spinnerFrame;
      text = 'Syncing...';
    } else if (status === 'error') {
      icon = 'x';
      text = 'Error';
    } else {
      icon = 'o';
      text = 'Idle';
    }

    return (
      <Text color={color}>
        {icon} {text}
      </Text>
    );
  };

  const ApplicationPanel = ({
    snapshot,
  }: {
    snapshot: UiState;
  }): React.ReactElement => {
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
            return (
              <EntitySection
                key={type}
                type={type}
                entities={Array.from(snapshot.entities.values())}
              />
            );
          })}
        </Box>

        {snapshot.manifestError && (
          <Box marginTop={1}>
            <Text color="red">Error: {snapshot.manifestError}</Text>
          </Box>
        )}
        {snapshot.syncError && (
          <Box marginTop={1}>
            <Text color="red">Sync Error: {snapshot.syncError}</Text>
          </Box>
        )}
      </Box>
    );
  };

  const Legend = (): React.ReactElement => (
    <Box marginTop={1}>
      <Text dimColor>
        <Text color={STATUS_COLORS.pending}>{STATUS_ICONS.pending}</Text>{' '}
        pending <Text color={STATUS_COLORS.building}>{SPINNER_FRAMES[0]}</Text>{' '}
        building <Text color={STATUS_COLORS.built}>{STATUS_ICONS.built}</Text>{' '}
        built <Text color={STATUS_COLORS.uploading}>{UPLOAD_FRAMES[0]}</Text>{' '}
        uploading{' '}
        <Text color={STATUS_COLORS.uploaded}>{STATUS_ICONS.uploaded}</Text>{' '}
        uploaded
      </Text>
    </Box>
  );

  const UI = (): React.ReactElement => {
    const [snapshot, setSnapshot] = useState<UiState>(
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

  const { unmount } = render(<UI />);
  return { unmount };
};
