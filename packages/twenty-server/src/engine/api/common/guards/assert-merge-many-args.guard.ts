import { isBoolean, isNumber, isObject } from 'class-validator';

import { isDefined } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  type CommonInput,
  type MergeManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';

export function assertMergeManyArgs(
  args: unknown,
): asserts args is CommonInput<MergeManyQueryArgs> {
  if (!isObject(args)) {
    throw new CommonQueryRunnerException(
      'Invalid argument: it must be an object',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  const argKeys = Object.keys(args);

  const allowedKeys = new Set([
    'ids',
    'conflictPriorityIndex',
    'dryRun',
    'selectedFields',
  ]);

  for (const key of argKeys) {
    if (!allowedKeys.has(key)) {
      throw new CommonQueryRunnerException(
        `Argument not allowed: ${key}`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
  }

  if (!('ids' in args) || !Array.isArray(args.ids)) {
    throw new CommonQueryRunnerException(
      'Missing required argument: "ids" (array)',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if (
    !('conflictPriorityIndex' in args) ||
    !isNumber(args.conflictPriorityIndex)
  ) {
    throw new CommonQueryRunnerException(
      'Missing required argument: "conflictPriorityIndex" (number)',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if (!('selectedFields' in args) || !isObject(args.selectedFields)) {
    throw new CommonQueryRunnerException(
      'Missing required argument: "selectedFields"',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if ('dryRun' in args && isDefined(args.dryRun) && !isBoolean(args.dryRun)) {
    throw new CommonQueryRunnerException(
      'Invalid argument: "dryRun" must be a boolean',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }
}
