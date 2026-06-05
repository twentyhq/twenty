import { type OrchestratorStateStepEvent } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { isObject, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const MAX_DETAIL_LINES = 50;

const VERB_BY_TYPE = {
  create: 'created',
  update: 'updated',
  delete: 'deleted',
} as const;

type ParsedSyncAction = {
  type: keyof typeof VERB_BY_TYPE;
  metadataName: string;
  label: string;
};

const getStringProperty = (
  value: Record<string, unknown>,
  key: string,
): string | undefined => {
  const property = value[key];

  return isString(property) ? property : undefined;
};

const parseSyncAction = (action: unknown): ParsedSyncAction | null => {
  if (!isDefined(action) || !isObject(action)) {
    return null;
  }

  const record = action as Record<string, unknown>;
  const type = record.type;
  const metadataName = getStringProperty(record, 'metadataName');

  if (
    (type !== 'create' && type !== 'update' && type !== 'delete') ||
    metadataName === undefined
  ) {
    return null;
  }

  if (type === 'create') {
    const flatEntity = isObject(record.flatEntity)
      ? (record.flatEntity as Record<string, unknown>)
      : {};

    const label =
      getStringProperty(flatEntity, 'name') ??
      getStringProperty(flatEntity, 'nameSingular') ??
      getStringProperty(flatEntity, 'universalIdentifier') ??
      'unknown';

    return { type, metadataName, label };
  }

  const label = getStringProperty(record, 'universalIdentifier') ?? 'unknown';

  return { type, metadataName, label };
};

export const formatSyncActionsSummary = (
  actions: unknown[],
): OrchestratorStateStepEvent[] => {
  const parsedActions = actions
    .map(parseSyncAction)
    .filter((action): action is ParsedSyncAction => action !== null);

  if (parsedActions.length === 0) {
    return [{ message: 'No metadata changes', status: 'info' }];
  }

  const counts = { create: 0, update: 0, delete: 0 };

  for (const action of parsedActions) {
    counts[action.type] += 1;
  }

  const summaryParts = [
    counts.create > 0 ? `${counts.create} created` : null,
    counts.update > 0 ? `${counts.update} updated` : null,
    counts.delete > 0 ? `${counts.delete} deleted` : null,
  ].filter((part): part is string => part !== null);

  const events: OrchestratorStateStepEvent[] = [
    { message: `Metadata changes: ${summaryParts.join(', ')}`, status: 'info' },
  ];

  const visibleActions = parsedActions.slice(0, MAX_DETAIL_LINES);

  for (const action of visibleActions) {
    events.push({
      message: `  ${VERB_BY_TYPE[action.type]} ${action.metadataName} ${action.label}`,
      status: 'info',
    });
  }

  const hiddenCount = parsedActions.length - visibleActions.length;

  if (hiddenCount > 0) {
    events.push({
      message: `  …and ${hiddenCount} more change(s)`,
      status: 'info',
    });
  }

  return events;
};
