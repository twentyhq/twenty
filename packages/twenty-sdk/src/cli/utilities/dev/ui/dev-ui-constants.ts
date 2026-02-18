import {
  type OrchestratorState,
  type OrchestratorStateEvent,
  type OrchestratorStateFileStatus,
  type OrchestratorStateStepStatus,
  type OrchestratorStateSyncStatus,
  type OrchestratorStateEntityInfo,
} from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { SyncableEntity } from 'twenty-shared/application';

export type DevUiStatus =
  | 'idle'
  | 'in_progress'
  | 'uploading'
  | 'done'
  | 'error';

export type DevUiStatusConfig = {
  color: string;
  icon: 'spinner' | 'upload' | string;
};

export const DEV_UI_STATUS_CONFIG: Record<DevUiStatus, DevUiStatusConfig> = {
  idle: { color: 'gray', icon: '○' },
  in_progress: { color: 'yellow', icon: 'spinner' },
  uploading: { color: 'cyan', icon: 'upload' },
  done: { color: 'green', icon: '✓' },
  error: { color: 'red', icon: '✗' },
};

export const mapStepStatusToDevUiStatus = (
  status: OrchestratorStateStepStatus,
): DevUiStatus => {
  const mapping: Record<OrchestratorStateStepStatus, DevUiStatus> = {
    idle: 'idle',
    in_progress: 'in_progress',
    done: 'done',
    error: 'error',
  };

  return mapping[status];
};

export const mapFileStatusToDevUiStatus = (
  status: OrchestratorStateFileStatus,
): DevUiStatus => {
  const mapping: Record<OrchestratorStateFileStatus, DevUiStatus> = {
    pending: 'idle',
    building: 'in_progress',
    uploading: 'uploading',
    success: 'done',
  };

  return mapping[status];
};

export const mapSyncStatusToDevUiStatus = (
  status: OrchestratorStateSyncStatus,
): DevUiStatus => {
  const mapping: Record<OrchestratorStateSyncStatus, DevUiStatus> = {
    idle: 'idle',
    building: 'in_progress',
    syncing: 'in_progress',
    synced: 'done',
    error: 'error',
  };

  return mapping[status];
};

export const SYNC_STATUS_LABELS: Record<OrchestratorStateSyncStatus, string> = {
  idle: 'Idle',
  building: 'Building...',
  syncing: 'Syncing...',
  synced: 'Synced',
  error: 'Error',
};

export const SPINNER_FRAMES = [
  '⠋',
  '⠙',
  '⠹',
  '⠸',
  '⠼',
  '⠴',
  '⠦',
  '⠧',
  '⠇',
  '⠏',
];

export const UPLOAD_FRAMES = ['↑', '⇡', '↟', '⤒'];

export const ENTITY_LABELS: Record<SyncableEntity, string> = {
  [SyncableEntity.Object]: 'Objects',
  [SyncableEntity.Field]: 'Fields',
  [SyncableEntity.LogicFunction]: 'Logic functions',
  [SyncableEntity.FrontComponent]: 'Front components',
  [SyncableEntity.Role]: 'Roles',
  [SyncableEntity.View]: 'Views',
  [SyncableEntity.NavigationMenuItem]: 'Navigation menu items',
  [SyncableEntity.PageLayout]: 'Page layouts',
};

export const ENTITY_ORDER = Object.keys(ENTITY_LABELS) as SyncableEntity[];

export const EVENT_COLORS: Record<OrchestratorStateEvent['status'], string> = {
  info: 'gray',
  success: 'green',
  error: 'red',
  warning: 'yellow',
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const shortenPath = (path: string, maxLength = 40): string => {
  if (path.length <= maxLength) return path;
  const parts = path.split('/');
  if (parts.length <= 2) return path;

  return `.../${parts.slice(-2).join('/')}`;
};

export const groupEntitiesByType = (
  entities: Map<string, OrchestratorStateEntityInfo>,
): Map<SyncableEntity, OrchestratorStateEntityInfo[]> => {
  const grouped = new Map<SyncableEntity, OrchestratorStateEntityInfo[]>();

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

export const getApplicationUrl = (state: OrchestratorState): string | null => {
  if (
    !state.frontendUrl ||
    !state.steps.resolveApplication.output.universalIdentifier
  ) {
    return null;
  }

  return `${state.frontendUrl}/settings/applications`;
};

export const mergeStepStatuses = (
  statuses: OrchestratorStateStepStatus[],
): OrchestratorStateStepStatus => {
  if (statuses.some((status) => status === 'error')) return 'error';
  if (statuses.some((status) => status === 'in_progress')) return 'in_progress';
  if (statuses.every((status) => status === 'done')) return 'done';

  return 'idle';
};

export type DevUiPipelineRow = {
  label: string;
  status: OrchestratorStateStepStatus;
};

export const getPipelineRows = (
  state: OrchestratorState,
): DevUiPipelineRow[] => {
  const entities = [...state.entities.values()];

  const isBuilding = entities.some((entity) => entity.status === 'building');
  const allUploaded =
    entities.length > 0 &&
    entities.every(
      (entity) => entity.status === 'uploading' || entity.status === 'success',
    );

  const resourcesBuildStatus: OrchestratorStateStepStatus = isBuilding
    ? 'in_progress'
    : allUploaded
      ? 'done'
      : 'idle';

  return [
    {
      label: 'Application Initialization',
      status: mergeStepStatuses([
        state.steps.checkServer.status,
        state.steps.ensureValidTokens.status,
        state.steps.resolveApplication.status,
      ]),
    },
    {
      label: 'Resources Build',
      status: resourcesBuildStatus,
    },
    {
      label: 'Resources Upload',
      status: state.steps.uploadFiles.status,
    },
    {
      label: 'Manifest Build',
      status: state.steps.buildManifest.status,
    },
    {
      label: 'Application Synchronization',
      status: state.steps.syncApplication.status,
    },
    {
      label: 'Api Client Generation',
      status: state.steps.generateApiClient.status,
    },
  ];
};
