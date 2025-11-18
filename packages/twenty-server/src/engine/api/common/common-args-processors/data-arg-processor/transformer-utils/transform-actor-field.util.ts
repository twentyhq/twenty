import { isNull, isUndefined } from '@sniptt/guards';
import { type FieldActorSource } from 'twenty-shared/types';

import { transformRawJsonField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-raw-json-field.util';

export const transformActorField = (
  value: {
    source?: FieldActorSource | null;
    context?: object | null;
  } | null,
  isNullEquivalenceEnabled: boolean = false,
): {
  source?: FieldActorSource | null;
  context?: object | null;
} | null => {
  if (isNull(value)) return null;

  return {
    source: value.source,
    context: isUndefined(value.context)
      ? undefined
      : transformRawJsonField(value.context, isNullEquivalenceEnabled),
  };
};
