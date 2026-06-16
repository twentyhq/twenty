import { isDefined } from 'twenty-shared/utils';

// Manual-trigger record fields moved from the flat trigger root
// ({{trigger.name}}) to a nested payload node ({{trigger.payload.name}}).
// The negative lookaheads keep this idempotent: references already pointing at
// `payload`/`metadata` are left untouched, so re-running the migration is a
// no-op. A field named exactly `payload` or `metadata` collides and is skipped
// — that risk was accepted when the nested keys were named.
const TRIGGER_VARIABLE_PREFIX_REGEX = /\{\{trigger\.(?!payload[.}])(?!metadata[.}])/g;

export const rewriteTriggerVariablesToPayload = <TValue>(
  value: TValue,
): { value: TValue; changed: boolean } => {
  if (!isDefined(value)) {
    return { value, changed: false };
  }

  const serialized = JSON.stringify(value);
  const rewritten = serialized.replace(
    TRIGGER_VARIABLE_PREFIX_REGEX,
    '{{trigger.payload.',
  );

  if (rewritten === serialized) {
    return { value, changed: false };
  }

  return { value: JSON.parse(rewritten) as TValue, changed: true };
};
