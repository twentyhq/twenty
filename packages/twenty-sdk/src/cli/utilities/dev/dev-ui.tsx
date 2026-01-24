import {
  devUIState,
  type DevEvent,
  type DevUISnapshot,
  type FileStatus,
  type EntityType,
  type EntityInfo,
} from './dev-ui-state';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

// Spinner frames for animated statuses
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const UPLOAD_FRAMES = ['↑', '⇡', '↟', '⤒'];

const STATUS_ICONS: Record<FileStatus, string> = {
  pending: '○',
  building: '◐', // Will be replaced by spinner
  built: '●',
  uploading: '↑', // Will be replaced by spinner
  uploaded: '✓',
};

const STATUS_COLORS: Record<FileStatus, string> = {
  pending: 'gray',
  building: 'yellow',
  built: 'blue',
  uploading: 'cyan',
  uploaded: 'green',
};

const ENTITY_LABELS: Record<EntityType, string> = {
  object: 'Objects',
  objectExtension: 'Object Extensions',
  function: 'Functions',
  frontComponent: 'Front Components',
  role: 'Roles',
};

const ENTITY_ORDER: EntityType[] = [
  'object',
  'objectExtension',
  'function',
  'frontComponent',
  'role',
];

const EVENT_COLORS: Record<DevEvent['status'], string> = {
  info: 'gray',
  success: 'green',
  error: 'red',
  warning: 'yellow',
};

const EVENT_ICONS: Record<DevEvent['type'], string> = {
  'file-change': '→',
  'manifest-build': '◆',
  'file-build': '●',
  'file-upload': '☁',
  sync: '↻',
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

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

const groupEntitiesByType = (
  entities: Map<string, EntityInfo>,
): Map<EntityType, EntityInfo[]> => {
  const grouped = new Map<EntityType, EntityInfo[]>();

  for (const type of ENTITY_ORDER) {
    grouped.set(type, []);
  }

  for (const entity of entities.values()) {
    const list = grouped.get(entity.type) ?? [];
    list.push(entity);
    grouped.set(entity.type, list);
  }

  return grouped;
};

// Compute unified status from manifest and sync status
type UnifiedStatus =
  | 'idle'
  | 'building'
  | 'built'
  | 'syncing'
  | 'synced'
  | 'error';

const getUnifiedStatus = (snapshot: DevUISnapshot): UnifiedStatus => {
  if (snapshot.manifestStatus === 'error' || snapshot.syncStatus === 'error') {
    return 'error';
  }
  if (snapshot.manifestStatus === 'building') {
    return 'building';
  }
  if (snapshot.syncStatus === 'syncing') {
    return 'syncing';
  }
  if (snapshot.syncStatus === 'synced') {
    return 'synced';
  }
  if (snapshot.manifestStatus === 'ready') {
    return 'built';
  }
  return 'idle';
};

const getApplicationUrl = (snapshot: DevUISnapshot): string | null => {
  if (!snapshot.frontendUrl || !snapshot.appUniversalIdentifier) {
    return null;
  }
  return `${snapshot.frontendUrl}/settings/applications`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Render function - uses dynamic import to avoid ESM/CJS issues
// ─────────────────────────────────────────────────────────────────────────────

export const renderDevUI = async (): Promise<{ unmount: () => void }> => {
  // Dynamic imports for ESM-only packages
  const [React, ink] = await Promise.all([import('react'), import('ink')]);

  const { useState, useEffect } = React;
  const { render, Box, Text, Static } = ink;

  // ─────────────────────────────────────────────────────────────────────────
  // Spinner Hook
  // ─────────────────────────────────────────────────────────────────────────

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

  // ─────────────────────────────────────────────────────────────────────────
  // Event Item Component
  // ─────────────────────────────────────────────────────────────────────────

  const EventItem = ({ event }: { event: DevEvent }): React.ReactElement => {
    const icon = EVENT_ICONS[event.type];
    const color = EVENT_COLORS[event.status];
    const time = formatTime(event.timestamp);

    return (
      <Box>
        <Text dimColor>{time} </Text>
        <Text color={color}>{icon} </Text>
        <Text color={color}>{event.message}</Text>
      </Box>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Animated Status Icon Component
  // ─────────────────────────────────────────────────────────────────────────

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

  // ─────────────────────────────────────────────────────────────────────────
  // Entity Row Component
  // ─────────────────────────────────────────────────────────────────────────

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

  // ─────────────────────────────────────────────────────────────────────────
  // Entity Section Component
  // ─────────────────────────────────────────────────────────────────────────

  const EntitySection = ({
    type,
    entities,
  }: {
    type: EntityType;
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

  // ─────────────────────────────────────────────────────────────────────────
  // Unified Status Indicator Component
  // ─────────────────────────────────────────────────────────────────────────

  const UnifiedStatusIndicator = ({
    snapshot,
  }: {
    snapshot: DevUISnapshot;
  }): React.ReactElement => {
    const spinnerFrame = useSpinner(SPINNER_FRAMES, 80);
    const status = getUnifiedStatus(snapshot);

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

  // ─────────────────────────────────────────────────────────────────────────
  // Application Panel Component
  // ─────────────────────────────────────────────────────────────────────────

  const ApplicationPanel = ({
    snapshot,
  }: {
    snapshot: DevUISnapshot;
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
        {/* Application Header */}
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

        {/* Entity Sections (directly under Application) */}
        <Box marginLeft={2} flexDirection="column">
          {ENTITY_ORDER.map((type) => {
            const entities = groupedEntities.get(type) ?? [];
            return <EntitySection key={type} type={type} entities={entities} />;
          })}
        </Box>

        {/* Errors */}
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

  // ─────────────────────────────────────────────────────────────────────────
  // Legend Component
  // ─────────────────────────────────────────────────────────────────────────

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

  // ─────────────────────────────────────────────────────────────────────────
  // Main DevUI Component
  // ─────────────────────────────────────────────────────────────────────────

  const DevUI = (): React.ReactElement => {
    const [snapshot, setSnapshot] = useState<DevUISnapshot>(
      devUIState.getSnapshot(),
    );

    useEffect(() => {
      return devUIState.subscribe(setSnapshot);
    }, []);

    return (
      <>
        {/* Event stream - rendered statically, scrolls up */}
        <Static items={snapshot.events}>
          {(event: DevEvent) => <EventItem key={event.id} event={event} />}
        </Static>

        {/* Status panel - updates in place */}
        <Box marginTop={1} flexDirection="column">
          <ApplicationPanel snapshot={snapshot} />
          <Legend />
        </Box>
      </>
    );
  };

  // Render the app
  const { unmount } = render(<DevUI />);
  return { unmount };
};
