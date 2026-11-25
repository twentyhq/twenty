import { isPlainObject } from 'twenty-shared/utils';

const RECORD_STEP_TYPES_WITH_STRICT_INPUT = new Set([
  'CREATE_RECORD',
  'UPSERT_RECORD',
]);

const DECLARED_INPUT_KEYS = new Set(['objectName', 'objectRecord']);

type DroppedInputKeys = {
  stepId: unknown;
  keys: string[];
};

export const dropUndeclaredKeysFromCreateAndUpsertRecords = (
  steps: unknown,
): {
  steps: unknown;
  hasChanged: boolean;
  droppedInputKeys: DroppedInputKeys[];
} => {
  if (!Array.isArray(steps)) {
    return { steps, hasChanged: false, droppedInputKeys: [] };
  }

  let hasChanged = false;
  const droppedInputKeys: DroppedInputKeys[] = [];

  const updatedSteps = steps.map((step: unknown) => {
    if (
      !isPlainObject(step) ||
      !RECORD_STEP_TYPES_WITH_STRICT_INPUT.has(String(step.type)) ||
      !isPlainObject(step.settings) ||
      !isPlainObject(step.settings.input)
    ) {
      return step;
    }

    const inputEntries = Object.entries(step.settings.input);
    const undeclaredKeys = inputEntries
      .map(([key]) => key)
      .filter((key) => !DECLARED_INPUT_KEYS.has(key));

    if (undeclaredKeys.length === 0) {
      return step;
    }

    droppedInputKeys.push({ stepId: step.id, keys: undeclaredKeys });
    hasChanged = true;

    return {
      ...step,
      settings: {
        ...step.settings,
        input: Object.fromEntries(
          inputEntries.filter(([key]) => DECLARED_INPUT_KEYS.has(key)),
        ),
      },
    };
  });

  return {
    steps: hasChanged ? updatedSteps : steps,
    hasChanged,
    droppedInputKeys,
  };
};
