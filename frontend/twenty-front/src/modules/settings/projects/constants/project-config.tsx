export const PROJECT_STATUSES = [
  { key: 'PLANNING', label: 'Planificación', color: '#8B5CF6' },
  { key: 'ACTIVE', label: 'Activo', color: '#10B981' },
  { key: 'ON_HOLD', label: 'En Pausa', color: '#F59E0B' },
  { key: 'COMPLETED', label: 'Completado', color: '#3B82F6' },
  { key: 'CANCELLED', label: 'Cancelado', color: '#EF4444' },
];

export const PROJECT_TASK_STATUSES = [
  { key: 'TODO', label: 'Por Hacer', color: '#6B7280' },
  { key: 'IN_PROGRESS', label: 'En Progreso', color: '#3B82F6' },
  { key: 'REVIEW', label: 'En Revisión', color: '#F59E0B' },
  { key: 'DONE', label: 'Completado', color: '#10B981' },
  { key: 'BLOCKED', label: 'Bloqueado', color: '#EF4444' },
];

export const PROJECT_TASK_PRIORITIES = [
  { key: 'LOW', label: 'Baja', color: '#10B981' },
  { key: 'MEDIUM', label: 'Media', color: '#F59E0B' },
  { key: 'HIGH', label: 'Alta', color: '#F97316' },
  { key: 'CRITICAL', label: 'Crítica', color: '#EF4444' },
];

export const GANTT_CONFIG = {
  rowHeight: 40,
  headerHeight: 50,
  columnWidth: 50,
  barHeight: 24,
  barCornerRadius: 4,
  dependenciesEnabled: true,
  criticalPathEnabled: true,
};

export const SPRINT_CONFIG = {
  durationWeeks: 2,
  defaultCapacity: 40,
  velocitySmoothing: 3,
};
