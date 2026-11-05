import { isString } from '@sniptt/guards';
import isEqual from 'lodash.isequal';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import {
  type StoredWorkflowNode,
  type StoredWorkflowVersionDefinition,
} from 'src/engine/core-modules/application/application-manifest/types/stored-workflow-version-definition.type';
import { normalizeStoredWorkflowErrorHandlingOptions } from 'src/engine/core-modules/application/application-manifest/utils/normalize-stored-workflow-error-handling-options.util';

// A run reads a code step's logic function only when the step has no inline code
const normalizeCodeStepInput = (input: unknown): unknown => {
  if (!isPlainObject(input) || !isString(input.code)) {
    return input;
  }

  const { logicFunctionId: _logicFunctionId, ...inlineInput } = input;

  return inlineInput;
};

// A run sorts by gqlOperationOrderBy alone; the record sorts it is computed from only drive the builder
const normalizeFindRecordsInput = (input: unknown): unknown => {
  if (!isPlainObject(input) || !isPlainObject(input.orderBy)) {
    return input;
  }

  const { recordSorts: _recordSorts, ...orderBy } = input.orderBy;

  return { ...input, orderBy };
};

// Only state no run reads is normalized, so a manifest edit is never compared away
const normalizeSettings = ({
  type,
  settings: { objectType, errorHandlingOptions, ...rest },
}: Pick<StoredWorkflowNode, 'type'> &
  Required<Pick<StoredWorkflowNode, 'settings'>>) => ({
  ...rest,
  ...(type === 'CODE' ? { input: normalizeCodeStepInput(rest.input) } : {}),
  ...(type === 'FIND_RECORDS'
    ? { input: normalizeFindRecordsInput(rest.input) }
    : {}),
  ...(type === 'MANUAL' ? {} : { objectType }),
  ...(isDefined(errorHandlingOptions)
    ? {
        errorHandlingOptions:
          normalizeStoredWorkflowErrorHandlingOptions(errorHandlingOptions),
      }
    : {}),
});

const normalizeNode = ({
  valid: _valid,
  position,
  nextStepIds,
  settings,
  ...rest
}: StoredWorkflowNode) => ({
  ...rest,
  nextStepIds: nextStepIds ?? [],
  ...(isDefined(position) ? { position } : {}),
  ...(isDefined(settings)
    ? { settings: normalizeSettings({ type: rest.type, settings }) }
    : {}),
});

// Compared as stored in jsonb, where undefined properties are dropped
const toJsonValue = ({
  triggers,
  steps,
}: StoredWorkflowVersionDefinition): unknown => {
  const stored: StoredWorkflowVersionDefinition = JSON.parse(
    JSON.stringify({ triggers: triggers ?? null, steps: steps ?? null }),
    (key, value) => (key === '__typename' ? undefined : value),
  );

  return JSON.parse(
    JSON.stringify({
      triggers: stored.triggers?.map(normalizeNode) ?? null,
      steps: stored.steps?.map(normalizeNode) ?? null,
    }),
  );
};

export const isSameWorkflowVersionDefinition = ({
  left,
  right,
}: {
  left: StoredWorkflowVersionDefinition;
  right: StoredWorkflowVersionDefinition;
}): boolean => isEqual(toJsonValue(left), toJsonValue(right));
