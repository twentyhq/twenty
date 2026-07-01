import { DESTRUCTIVE_METADATA_NAMES } from '@/cli/constants/destructive-metadata-names';
import { getFlatEntityName } from '@/cli/utilities/dev/orchestrator/steps/get-flat-entity-name';
import chalk from 'chalk';
import { type SyncAction } from 'twenty-shared/metadata';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

const MAX_VALUE_LENGTH = 80;

const DENIED_ATTRIBUTE_KEYS = new Set([
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'universalIdentifier',
  '__typename',
]);

const ACTION_TYPE_ORDER = { create: 0, update: 1, delete: 2 } as const;

const SIGN_BY_TYPE = { create: '+', update: '~', delete: '-' } as const;

const VERB_BY_TYPE = {
  create: 'will be created',
  update: 'will be updated in-place',
  delete: 'will be destroyed',
} as const;

const isDestructiveAction = (action: SyncAction): boolean =>
  action.type === 'delete' &&
  DESTRUCTIVE_METADATA_NAMES.has(action.metadataName);

export const hasDestructiveActions = (
  actions: SyncAction[] | undefined,
): boolean => (actions ?? []).some(isDestructiveAction);

export const countDestructiveActions = (
  actions: SyncAction[] | undefined,
): number => (actions ?? []).filter(isDestructiveAction).length;

const truncate = (value: string): string =>
  value.length > MAX_VALUE_LENGTH
    ? `${value.slice(0, MAX_VALUE_LENGTH - 1)}…`
    : value;

export const formatValue = (value: unknown): string => {
  if (!isDefined(value)) {
    return 'null';
  }

  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }

  return truncate(JSON.stringify(value));
};

const MASKED_VALUE = '(secret)';

const getApplicationVariableSecrecy = (
  action: SyncAction,
): boolean | undefined => {
  const fromFlatEntity = action.flatEntity?.isSecret;

  if (typeof fromFlatEntity === 'boolean') {
    return fromFlatEntity;
  }

  if (action.type === 'update') {
    const fromDiff = action.diff?.isSecret?.after;

    if (typeof fromDiff === 'boolean') {
      return fromDiff;
    }
  }

  return undefined;
};

const shouldMaskValue = (action: SyncAction, key: string): boolean => {
  if (action.metadataName !== 'applicationVariable' || key !== 'value') {
    return false;
  }

  return getApplicationVariableSecrecy(action) !== false;
};

export const selectEntityAttributes = (
  flatEntity: SyncAction['flatEntity'],
): [string, unknown][] => {
  if (!isDefined(flatEntity)) {
    return [];
  }

  return Object.entries(flatEntity)
    .filter(
      ([key, value]) =>
        !DENIED_ATTRIBUTE_KEYS.has(key) &&
        !key.endsWith('Id') &&
        isDefined(value),
    )
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
};

const getActionEntityName = (action: SyncAction): string =>
  getFlatEntityName(action.flatEntity) ??
  (action.type === 'create' ? 'unknown' : action.universalIdentifier);

const sortActionsByGroupThenType = (actions: SyncAction[]): SyncAction[] => {
  const firstAppearanceByMetadataName = new Map<string, number>();

  actions.forEach((action, position) => {
    if (!firstAppearanceByMetadataName.has(action.metadataName)) {
      firstAppearanceByMetadataName.set(action.metadataName, position);
    }
  });

  return [...actions].sort((a, b) => {
    const groupA = firstAppearanceByMetadataName.get(a.metadataName) ?? 0;
    const groupB = firstAppearanceByMetadataName.get(b.metadataName) ?? 0;

    if (groupA !== groupB) {
      return groupA - groupB;
    }

    const typeA = ACTION_TYPE_ORDER[a.type];
    const typeB = ACTION_TYPE_ORDER[b.type];

    if (typeA !== typeB) {
      return typeA - typeB;
    }

    return getActionEntityName(a).localeCompare(getActionEntityName(b));
  });
};

const colorizeByType = (type: SyncAction['type'], text: string): string => {
  if (type === 'create') {
    return chalk.green(text);
  }

  if (type === 'update') {
    return chalk.yellow(text);
  }

  return chalk.red(text);
};

const formatBlockHeader = (action: SyncAction): string =>
  chalk.bold(
    `  # ${action.metadataName} "${getActionEntityName(action)}" ${VERB_BY_TYPE[action.type]}`,
  );

const formatEntityAttributeLines = (
  action: Extract<SyncAction, { type: 'create' | 'delete' }>,
): string[] => {
  const entries = selectEntityAttributes(action.flatEntity);

  if (entries.length === 0) {
    if (action.type === 'delete') {
      return [
        colorizeByType(
          'delete',
          `  - name = ${formatValue(getActionEntityName(action))}`,
        ),
      ];
    }

    return [colorizeByType('create', '  + (no attributes to display)')];
  }

  const padding = Math.max(...entries.map(([key]) => key.length));
  const sign = SIGN_BY_TYPE[action.type];

  return entries.map(([key, value]) =>
    colorizeByType(
      action.type,
      `  ${sign} ${key.padEnd(padding)} = ${
        shouldMaskValue(action, key) ? MASKED_VALUE : formatValue(value)
      }`,
    ),
  );
};

const formatUpdateAttributeLines = (
  action: Extract<SyncAction, { type: 'update' }>,
): string[] => {
  const diff = action.diff;

  if (!isDefined(diff)) {
    return [];
  }

  const keys = Object.keys(diff).sort((a, b) => a.localeCompare(b));

  if (keys.length === 0) {
    return [];
  }

  const padding = Math.max(...keys.map((key) => key.length));

  return keys.map((key) => {
    const masked = shouldMaskValue(action, key);
    const before = masked ? MASKED_VALUE : formatValue(diff[key].before);
    const after = masked ? MASKED_VALUE : formatValue(diff[key].after);

    return `  ${chalk.yellow('~')} ${chalk.yellow(key.padEnd(padding))} = ${chalk.red(before)} ${chalk.dim('->')} ${chalk.green(after)}`;
  });
};

const formatBlock = (action: SyncAction): string | null => {
  if (action.type === 'update') {
    const attributeLines = formatUpdateAttributeLines(action);

    if (attributeLines.length === 0) {
      return null;
    }

    return [formatBlockHeader(action), ...attributeLines].join('\n');
  }

  return [
    formatBlockHeader(action),
    ...formatEntityAttributeLines(action),
  ].join('\n');
};

const formatFooter = (counts: {
  create: number;
  update: number;
  delete: number;
}): string =>
  `Plan: ${chalk.green(`${counts.create} to add`)}, ${chalk.yellow(
    `${counts.update} to change`,
  )}, ${chalk.red(`${counts.delete} to destroy`)}.`;

const formatDestructiveWarning = (actions: SyncAction[]): string => {
  const deletes = actions.filter(isDestructiveAction);

  const lines = [
    chalk.red.bold(
      `Warning: ${deletes.length} destructive change(s) will permanently delete data.`,
    ),
  ];

  for (const action of deletes) {
    const detail =
      action.metadataName === 'objectMetadata'
        ? 'drops the table and all its rows'
        : action.metadataName === 'fieldMetadata'
          ? 'drops the column and its data'
          : 'will be removed';

    lines.push(
      chalk.red(
        `  - ${action.metadataName} "${getActionEntityName(action)}" — ${detail}`,
      ),
    );
  }

  lines.push(
    chalk.red('Destroys are irreversible. Review carefully before applying.'),
  );

  return lines.join('\n');
};

export const formatSyncActionsPlan = (
  actions: SyncAction[] | undefined,
): string => {
  if (!isNonEmptyArray(actions)) {
    return 'No changes. Twenty metadata matches your manifest.';
  }

  const counts = { create: 0, update: 0, delete: 0 };

  for (const action of actions) {
    counts[action.type] += 1;
  }

  const blocks = sortActionsByGroupThenType(actions)
    .map(formatBlock)
    .filter(isDefined);

  const sections = [
    chalk.bold('Twenty will perform the following actions:'),
    '',
    blocks.join('\n\n'),
    '',
    formatFooter(counts),
  ];

  if (hasDestructiveActions(actions)) {
    sections.push('', formatDestructiveWarning(actions));
  }

  return sections.join('\n');
};
