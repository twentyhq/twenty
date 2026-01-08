import { msg } from '@lingui/core/macro';
import { isNull } from '@sniptt/guards';
import { FieldActorSource } from 'twenty-shared/types';

import { validateRatingAndSelectFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-rating-and-select-field-or-throw.util';
import { validateRawJsonFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-raw-json-field-or-throw.util';
import { validateTextFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-text-field-or-throw.util';
import { validateUUIDFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-uuid-field-or-throw.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const validateActorFieldOrThrow = (
  value: unknown,
  fieldName: string,
): { source: FieldActorSource; context: Record<string, unknown> } | null => {
  const preValidatedValue = validateRawJsonFieldOrThrow(value, fieldName);

  if (isNull(preValidatedValue)) return null;

  for (const [subField, subFieldValue] of Object.entries(preValidatedValue)) {
    switch (subField) {
      case 'source':
        validateRatingAndSelectFieldOrThrow(
          subFieldValue,
          `${fieldName}.${subField}`,
          Object.keys(FieldActorSource),
        );
        break;
      case 'context':
        validateRawJsonFieldOrThrow(subFieldValue, `${fieldName}.${subField}`);
        break;
      case 'name':
        validateTextFieldOrThrow(subFieldValue, `${fieldName}.${subField}`);
        break;
      case 'workspaceMemberId':
        validateUUIDFieldOrThrow(subFieldValue, `${fieldName}.${subField}`);
        break;
      default:
        throw new CommonQueryRunnerException(
          `Invalid subfield ${subField} for actor field "${fieldName}"`,
          CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
          { userFriendlyMessage: msg`Invalid value for actor.` },
        );
    }
  }

  return value as {
    source: FieldActorSource;
    context: Record<string, unknown>;
  };
};
