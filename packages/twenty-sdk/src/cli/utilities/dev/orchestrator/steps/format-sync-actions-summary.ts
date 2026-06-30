import { type OrchestratorStateStepEvent } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { type SyncAction } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

const MAX_DETAIL_LINES = 50;

const VERB_BY_TYPE = {
  create: 'created',
  update: 'updated',
  delete: 'deleted',
} as const;

const getFlatEntityName = (
  flatEntity: SyncAction['flatEntity'],
): string | null => {
  const universalIdentifier = flatEntity?.universalIdentifier;

  return (
    flatEntity?.name ??
    flatEntity?.nameSingular ??
    (typeof universalIdentifier === 'string' ? universalIdentifier : null)
  );
};

const getEntityLabel = (action: SyncAction): string => {
  if (action.type === 'create') {
    return getFlatEntityName(action.flatEntity) ?? 'unknown';
  }

  const nameLabel = getFlatEntityName(action.flatEntity);

  if (nameLabel && nameLabel !== action.universalIdentifier) {
    return `${nameLabel} (${action.universalIdentifier})`;
  }

  return action.universalIdentifier;
};

const getChangedFieldsNote = (action: SyncAction): string => {
  if (action.type !== 'update' || !isDefined(action.diff)) {
    return '';
  }

  const changedFields = Object.keys(action.diff);

  if (changedFields.length === 0) {
    return '';
  }

  return ` [${changedFields.join(', ')}] changed`;
};

export const formatSyncActionsSummary = (
  actions: SyncAction[] | undefined,
): OrchestratorStateStepEvent[] => {
  const definedActions = actions ?? [];

  if (definedActions.length === 0) {
    return [{ message: 'No metadata changes', status: 'info' }];
  }

  const counts = { create: 0, update: 0, delete: 0 };

  for (const action of definedActions) {
    counts[action.type] += 1;
  }

  const summaryParts = [
    counts.create > 0 ? `${counts.create} created` : null,
    counts.update > 0 ? `${counts.update} updated` : null,
    counts.delete > 0 ? `${counts.delete} deleted` : null,
  ].filter(isDefined);

  const events: OrchestratorStateStepEvent[] = [
    { message: `Metadata changes: ${summaryParts.join(', ')}`, status: 'info' },
  ];

  const visibleActions = definedActions.slice(0, MAX_DETAIL_LINES);

  for (const action of visibleActions) {
    const label = getEntityLabel(action);
    const changedFieldsNote = getChangedFieldsNote(action);

    events.push({
      message: `  ${VERB_BY_TYPE[action.type]} ${action.metadataName} ${label}${changedFieldsNote}`,
      status: 'info',
    });
  }

  const hiddenCount = definedActions.length - visibleActions.length;

  if (hiddenCount > 0) {
    events.push({
      message: `  …and ${hiddenCount} more change(s)`,
      status: 'info',
    });
  }

  return events;
};
