import { isBoolean, isNumber, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { isDestructiveAppPlanAction } from '@/app/deployment/is-destructive-app-plan-action';
import { groupAppPlanCascades } from '@/app/deployment/group-app-plan-cascades';
import {
  type AppPlanAction,
  type AppPlanSummary,
} from '@/app/deployment/types/app-plan.type';
import { formatDataValue } from '@/data/format-data-value';
import { boldText, colorText, dimText } from '@/output/style';

const MAX_VALUE_LENGTH = 80;

const MASKED_VALUE = '(secret)';

const NO_PRUNE_HINT =
  'Entities missing from your source are destroyed by default. Re-run with --no-prune to keep them.';

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

const COLOR_BY_TYPE = {
  create: 'green',
  update: 'yellow',
  delete: 'red',
} as const;

const VERB_BY_TYPE = {
  create: 'will be created',
  update: 'will be updated in-place',
  delete: 'will be destroyed',
} as const;

const formatPlanValue = (value: unknown): string => {
  if (!isDefined(value)) {
    return 'null';
  }

  if (isBoolean(value) || isNumber(value)) {
    return String(value);
  }

  const text = (JSON.stringify(value) ?? String(value)).replace(
    /[\x7f-\x9f]/g,
    (character) =>
      `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );

  return text.length > MAX_VALUE_LENGTH
    ? `${text.slice(0, MAX_VALUE_LENGTH - 1)}…`
    : text;
};

const isApplicationVariableSecret = (action: AppPlanAction) => {
  const fromFlatEntity = action.flatEntity?.isSecret;

  if (isBoolean(fromFlatEntity)) {
    return fromFlatEntity;
  }

  const fromDiff = action.diff?.isSecret?.after;

  return isBoolean(fromDiff) ? fromDiff : undefined;
};

const shouldMaskValue = (action: AppPlanAction, key: string) =>
  action.metadataName === 'applicationVariable' &&
  key === 'value' &&
  isApplicationVariableSecret(action) !== false;

const selectEntityAttributes = (flatEntity: AppPlanAction['flatEntity']) =>
  Object.entries(flatEntity ?? {})
    .filter(
      ([key, value]) =>
        !DENIED_ATTRIBUTE_KEYS.has(key) &&
        !key.endsWith('Id') &&
        isDefined(value),
    )
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

const getActionEntityName = (action: AppPlanAction) =>
  [
    action.flatEntity?.name,
    action.flatEntity?.nameSingular,
    action.flatEntity?.universalIdentifier,
  ].find(isString) ??
  (action.type === 'create'
    ? 'unknown'
    : (action.universalIdentifier ?? 'unknown'));

const sortActions = (actions: AppPlanAction[]) => {
  const firstPositionByMetadataName = new Map<string, number>();

  actions.forEach((action, position) => {
    if (!firstPositionByMetadataName.has(action.metadataName)) {
      firstPositionByMetadataName.set(action.metadataName, position);
    }
  });

  return [...actions].sort(
    (actionA, actionB) =>
      (firstPositionByMetadataName.get(actionA.metadataName) ?? 0) -
        (firstPositionByMetadataName.get(actionB.metadataName) ?? 0) ||
      ACTION_TYPE_ORDER[actionA.type] - ACTION_TYPE_ORDER[actionB.type] ||
      getActionEntityName(actionA).localeCompare(getActionEntityName(actionB)),
  );
};

const formatBlockHeader = (action: AppPlanAction, stream: NodeJS.WriteStream) =>
  boldText(
    `  # ${formatDataValue(action.metadataName)} ${formatPlanValue(getActionEntityName(action))} ${VERB_BY_TYPE[action.type]}`,
    stream,
  );

const formatEntityAttributeLines = (
  action: AppPlanAction,
  stream: NodeJS.WriteStream,
) => {
  const entries = selectEntityAttributes(action.flatEntity);
  const color = COLOR_BY_TYPE[action.type];

  if (entries.length === 0) {
    return [
      action.type === 'delete'
        ? colorText(
            color,
            `  - name = ${formatPlanValue(getActionEntityName(action))}`,
            stream,
          )
        : colorText(color, '  + (no attributes to display)', stream),
    ];
  }

  const padding = Math.max(...entries.map(([key]) => key.length));

  return entries.map(([key, value]) =>
    colorText(
      color,
      `  ${SIGN_BY_TYPE[action.type]} ${key.padEnd(padding)} = ${
        shouldMaskValue(action, key) ? MASKED_VALUE : formatPlanValue(value)
      }`,
      stream,
    ),
  );
};

const formatUpdateAttributeLines = (
  action: AppPlanAction,
  stream: NodeJS.WriteStream,
) => {
  const keys = Object.keys(action.diff ?? {}).sort((keyA, keyB) =>
    keyA.localeCompare(keyB),
  );

  if (keys.length === 0) {
    return [];
  }

  const padding = Math.max(...keys.map((key) => key.length));

  return keys.map((key) => {
    const change = action.diff?.[key];
    const masked = shouldMaskValue(action, key);
    const before = masked ? MASKED_VALUE : formatPlanValue(change?.before);
    const after = masked ? MASKED_VALUE : formatPlanValue(change?.after);

    return `  ${colorText('yellow', '~', stream)} ${colorText('yellow', key.padEnd(padding), stream)} = ${colorText('red', before, stream)} ${dimText('->', stream)} ${colorText('green', after, stream)}`;
  });
};

const formatCascadeLine = ({
  cascades,
  stream,
}: {
  cascades: AppPlanAction[];
  stream: NodeJS.WriteStream;
}) => {
  const countByMetadataName = new Map<string, number>();

  for (const cascade of cascades) {
    countByMetadataName.set(
      cascade.metadataName,
      (countByMetadataName.get(cascade.metadataName) ?? 0) + 1,
    );
  }

  const counts = [...countByMetadataName.entries()]
    .sort(
      ([nameA, countA], [nameB, countB]) =>
        countB - countA || nameA.localeCompare(nameB),
    )
    .map(([metadataName, count]) => `${count} ${metadataName}`)
    .join(', ');

  return colorText(
    'red',
    `  - also destroys ${cascades.length} dependent ${cascades.length === 1 ? 'entity' : 'entities'}: ${counts}`,
    stream,
  );
};

const formatBlock = ({
  action,
  cascades,
  stream,
}: {
  action: AppPlanAction;
  cascades: AppPlanAction[];
  stream: NodeJS.WriteStream;
}) => {
  const attributeLines =
    action.type === 'update'
      ? formatUpdateAttributeLines(action, stream)
      : formatEntityAttributeLines(action, stream);

  return action.type === 'update' && attributeLines.length === 0
    ? undefined
    : [
        formatBlockHeader(action, stream),
        ...attributeLines,
        ...(cascades.length > 0
          ? [formatCascadeLine({ cascades, stream })]
          : []),
      ].join('\n');
};

// A dropped table takes its own columns, so only fields on other objects are named.
const countFieldsOnOtherObjects = ({
  action,
  cascades,
}: {
  action: Pick<
    AppPlanAction,
    'metadataName' | 'universalIdentifier' | 'flatEntity'
  >;
  cascades: AppPlanAction[];
}) => {
  const rootObjectUniversalIdentifier =
    action.metadataName === 'objectMetadata'
      ? action.universalIdentifier
      : action.flatEntity?.objectMetadataUniversalIdentifier;

  return cascades.filter(
    (cascade) =>
      cascade.metadataName === 'fieldMetadata' &&
      cascade.flatEntity?.objectMetadataUniversalIdentifier !==
        rootObjectUniversalIdentifier,
  ).length;
};

const formatDestructiveConsequence = ({
  action,
  cascades,
}: {
  action: Pick<
    AppPlanAction,
    'metadataName' | 'universalIdentifier' | 'flatEntity'
  >;
  cascades: AppPlanAction[];
}) => {
  const consequence =
    action.metadataName === 'objectMetadata'
      ? 'drops the table and all its rows'
      : 'drops the column and its data';
  const fieldsOnOtherObjects = countFieldsOnOtherObjects({ action, cascades });

  if (fieldsOnOtherObjects === 0) {
    return consequence;
  }

  const fieldLabel = fieldsOnOtherObjects === 1 ? 'field' : 'fields';

  return `${consequence}, and ${fieldsOnOtherObjects} ${fieldLabel} on other objects`;
};

const formatDestructiveWarning = ({
  primaryActions,
  cascadesByRoot,
  stream,
}: {
  primaryActions: AppPlanAction[];
  cascadesByRoot: Map<AppPlanAction, AppPlanAction[]>;
  stream: NodeJS.WriteStream;
}) => {
  const destructiveActions = primaryActions.filter(isDestructiveAppPlanAction);

  return [
    boldText(
      colorText(
        'red',
        `Warning: ${destructiveActions.length} destructive change(s) will permanently delete data.`,
        stream,
      ),
      stream,
    ),
    ...destructiveActions.map((action) =>
      colorText(
        'red',
        `  - ${formatDataValue(action.metadataName)} ${formatPlanValue(getActionEntityName(action))}: ${formatDestructiveConsequence(
          {
            action,
            cascades: cascadesByRoot.get(action) ?? [],
          },
        )}`,
        stream,
      ),
    ),
    colorText(
      'red',
      'Destroys are irreversible. Review carefully before applying.',
      stream,
    ),
  ].join('\n');
};

export const formatAppPlanActions = ({
  actions,
  summary,
  inferDeletionFromMissingEntities,
  stream = process.stdout,
}: {
  actions: AppPlanAction[];
  summary: AppPlanSummary;
  inferDeletionFromMissingEntities: boolean | undefined;
  stream?: NodeJS.WriteStream;
}) => {
  if (actions.length === 0) {
    return 'No changes. Twenty metadata matches your manifest.';
  }

  const { primaryActions, cascadesByRoot } = groupAppPlanCascades(actions);

  const blocks = sortActions(primaryActions)
    .map((action) =>
      formatBlock({
        action,
        cascades: cascadesByRoot.get(action) ?? [],
        stream,
      }),
    )
    .filter(isDefined);

  return [
    boldText('Twenty will perform the following actions:', stream),
    '',
    blocks.join('\n\n'),
    '',
    `Plan: ${colorText('green', `${summary.create} to add`, stream)}, ${colorText('yellow', `${summary.update} to change`, stream)}, ${colorText('red', `${summary.delete} to destroy`, stream)}.`,
    ...(summary.cascaded > 0
      ? [
          dimText(
            `${summary.cascaded} of the ${summary.delete} deletions cascade from the ones listed above.`,
            stream,
          ),
        ]
      : []),
    ...(!isDefined(inferDeletionFromMissingEntities) && summary.delete > 0
      ? [dimText(NO_PRUNE_HINT, stream)]
      : []),
    ...(summary.destructive > 0
      ? [
          '',
          formatDestructiveWarning({ primaryActions, cascadesByRoot, stream }),
        ]
      : []),
  ].join('\n');
};

export const formatAppPlan = ({
  applicationName,
  apiUrl,
  actions,
  summary,
  inferDeletionFromMissingEntities,
}: {
  applicationName: string;
  apiUrl: string;
  actions: AppPlanAction[];
  summary: AppPlanSummary;
  inferDeletionFromMissingEntities: boolean | undefined;
}) =>
  [
    `Plan for ${formatDataValue(applicationName)} on ${apiUrl}`,
    formatAppPlanActions({
      actions,
      summary,
      inferDeletionFromMissingEntities,
    }),
    'Use --json for complete action details.',
    'Nothing was registered, uploaded or synchronized. The server may return different actions when you apply.',
  ].join('\n\n');
