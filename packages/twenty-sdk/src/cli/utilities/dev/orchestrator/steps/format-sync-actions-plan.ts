import { getFlatEntityName } from '@/cli/utilities/dev/orchestrator/steps/get-flat-entity-name';
import chalk from 'chalk';
import { type SyncAction } from 'twenty-shared/metadata';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

const MAX_VALUE_LENGTH = 80;

const METADATA_GROUP_ORDER: readonly string[] = [
  'objectMetadata',
  'fieldMetadata',
  'index',
  'view',
  'viewField',
  'viewFieldGroup',
  'viewGroup',
  'viewSort',
  'viewFilter',
  'viewFilterGroup',
  'pageLayout',
  'pageLayoutTab',
  'pageLayoutWidget',
  'role',
  'roleTarget',
  'objectPermission',
  'fieldPermission',
  'permissionFlag',
  'rolePermissionFlag',
  'logicFunction',
  'agent',
  'skill',
  'commandMenuItem',
  'navigationMenuItem',
  'frontComponent',
  'webhook',
  'applicationVariable',
  'connectionProvider',
  'searchFieldMetadata',
];

const ATTRIBUTE_PRIORITY: readonly string[] = [
  'name',
  'nameSingular',
  'namePlural',
  'label',
  'labelSingular',
  'labelPlural',
  'description',
  'icon',
  'type',
  'isNullable',
  'defaultValue',
  'options',
  'isActive',
  'isCustom',
  'isSystem',
];

const DENIED_ATTRIBUTE_KEYS = new Set([
  'id',
  'workspaceId',
  'applicationId',
  'standardId',
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

export const hasDestructiveActions = (
  actions: SyncAction[] | undefined,
): boolean => (actions ?? []).some((action) => action.type === 'delete');

export const countDeletes = (actions: SyncAction[] | undefined): number =>
  (actions ?? []).filter((action) => action.type === 'delete').length;

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

const shouldMaskValue = (action: SyncAction, key: string): boolean =>
  action.metadataName === 'applicationVariable' &&
  key === 'value' &&
  action.flatEntity?.isSecret === true;

const compareByPriority = (
  priority: readonly string[],
  a: string,
  b: string,
): number => {
  const indexA = priority.indexOf(a);
  const indexB = priority.indexOf(b);
  const rankA = indexA === -1 ? priority.length : indexA;
  const rankB = indexB === -1 ? priority.length : indexB;

  return rankA !== rankB ? rankA - rankB : a.localeCompare(b);
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
    .sort(([keyA], [keyB]) =>
      compareByPriority(ATTRIBUTE_PRIORITY, keyA, keyB),
    );
};

const getActionEntityName = (action: SyncAction): string =>
  getFlatEntityName(action.flatEntity) ??
  (action.type === 'create' ? 'unknown' : action.universalIdentifier);

const groupRank = (metadataName: string): number => {
  const index = METADATA_GROUP_ORDER.indexOf(metadataName);

  return index === -1 ? METADATA_GROUP_ORDER.length : index;
};

const compareActions = (a: SyncAction, b: SyncAction): number => {
  const rankA = groupRank(a.metadataName);
  const rankB = groupRank(b.metadataName);

  if (rankA !== rankB) {
    return rankA - rankB;
  }

  if (a.metadataName !== b.metadataName) {
    return a.metadataName.localeCompare(b.metadataName);
  }

  const typeA = ACTION_TYPE_ORDER[a.type];
  const typeB = ACTION_TYPE_ORDER[b.type];

  if (typeA !== typeB) {
    return typeA - typeB;
  }

  return getActionEntityName(a).localeCompare(getActionEntityName(b));
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

  const keys = Object.keys(diff).sort((a, b) =>
    compareByPriority(ATTRIBUTE_PRIORITY, a, b),
  );

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
  const deletes = actions.filter((action) => action.type === 'delete');

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

  const blocks = [...actions]
    .sort(compareActions)
    .map(formatBlock)
    .filter(isDefined);

  const sections = [
    chalk.bold('Twenty will perform the following actions:'),
    '',
    blocks.join('\n\n'),
    '',
    formatFooter(counts),
  ];

  if (counts.delete > 0) {
    sections.push('', formatDestructiveWarning(actions));
  }

  return sections.join('\n');
};
