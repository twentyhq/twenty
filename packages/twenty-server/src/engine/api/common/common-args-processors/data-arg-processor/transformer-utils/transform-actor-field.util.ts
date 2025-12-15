import { isNull, isUndefined } from '@sniptt/guards';
import { type FieldActorSource } from 'twenty-shared/types';

import { transformRawJsonField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-raw-json-field.util';
import { transformTextField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-text-field.util';

export const transformActorField = (
  value: {
    source?: FieldActorSource | null;
    context?: object | string | null;
    name?: string | null;
    workspaceMemberId?: string | null;
  } | null,
): {
  source?: FieldActorSource | null;
  context?: object | string | null;
  name?: string | null;
  workspaceMemberId?: string | null;
} | null => {
  if (isNull(value)) return null;

  return {
    source: value.source,
    context: isUndefined(value.context)
      ? undefined
      : transformRawJsonField(value.context),
    name: isUndefined(value.name) ? undefined : transformTextField(value.name),
    workspaceMemberId: isUndefined(value.workspaceMemberId)
      ? undefined
      : value.workspaceMemberId,
  };
};
