import { msg } from '@lingui/core/macro';

import { type FilterOperator } from 'src/engine/api/common/common-args-processors/filter-arg-processor/types/filter-operator.type';
import { getOperatorsForFieldType } from 'src/engine/api/common/common-args-processors/filter-arg-processor/utils/get-operators-for-field-type.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import type { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const validateOperatorForFieldTypeOrThrow = (
  operator: FilterOperator,
  fieldMetadata: FlatFieldMetadata,
  fieldName: string,
): void => {
  const allowedOperators = getOperatorsForFieldType(fieldMetadata.type);

  if (!allowedOperators.includes(operator)) {
    const fieldType = fieldMetadata.type;
    const allowedOperatorsString = allowedOperators.join(', ');

    throw new CommonQueryRunnerException(
      `Operator "${operator}" is not valid for field "${fieldName}" of type ${fieldType} - Allowed operators: ${allowedOperatorsString}`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
      {
        userFriendlyMessage: msg`Invalid filter : Operator "${operator}" is not valid for this "${fieldName}" ${fieldType} field`,
      },
    );
  }
};
