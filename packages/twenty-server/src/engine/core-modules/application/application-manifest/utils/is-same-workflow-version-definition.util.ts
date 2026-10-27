import isEqual from 'lodash.isequal';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type UniversalFlatWorkflowVersion } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow-version.type';

type WorkflowVersionDefinition = Pick<
  UniversalFlatWorkflowVersion,
  'triggers' | 'steps'
>;

const withoutTypenames = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(withoutTypenames);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== '__typename')
      .map(([key, entry]) => [key, withoutTypenames(entry)]),
  );
};

// Builder state no run reads: Apollo typenames, the step valid flag, the manual trigger objectType,
// null next steps or position, and retry counts older builders stored as booleans
const normalizeSettings = ({
  type,
  settings,
}: {
  type: unknown;
  settings: Record<string, unknown>;
}) => {
  const { objectType, errorHandlingOptions, ...rest } = settings;
  const retryOnFailure = isPlainObject(errorHandlingOptions)
    ? errorHandlingOptions.retryOnFailure
    : undefined;

  return {
    ...rest,
    ...(type === 'MANUAL' ? {} : { objectType }),
    errorHandlingOptions:
      isPlainObject(errorHandlingOptions) && isPlainObject(retryOnFailure)
        ? {
            ...errorHandlingOptions,
            retryOnFailure: {
              ...retryOnFailure,
              value: Number(retryOnFailure.value),
            },
          }
        : errorHandlingOptions,
  };
};

const normalizeNode = (node: unknown): unknown => {
  if (!isPlainObject(node)) {
    return node;
  }

  const { valid: _valid, position, nextStepIds, settings, ...rest } = node;
  const normalizedSettings = isPlainObject(settings)
    ? normalizeSettings({ type: rest.type, settings })
    : settings;

  return {
    ...rest,
    nextStepIds: nextStepIds ?? [],
    ...(isDefined(position) ? { position } : {}),
    ...(isDefined(normalizedSettings) ? { settings: normalizedSettings } : {}),
  };
};

// Compared as stored in jsonb, where undefined properties are dropped
const toJsonValue = ({
  triggers,
  steps,
}: WorkflowVersionDefinition): unknown => {
  const json = withoutTypenames(
    JSON.parse(
      JSON.stringify({ triggers: triggers ?? null, steps: steps ?? null }),
    ),
  ) as { triggers: unknown[] | null; steps: unknown[] | null };

  return JSON.parse(
    JSON.stringify({
      triggers: json.triggers?.map(normalizeNode) ?? null,
      steps: json.steps?.map(normalizeNode) ?? null,
    }),
  );
};

export const isSameWorkflowVersionDefinition = (
  left: WorkflowVersionDefinition,
  right: WorkflowVersionDefinition,
): boolean => isEqual(toJsonValue(left), toJsonValue(right));
