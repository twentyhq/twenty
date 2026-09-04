import { isBoolean, isEnum, isObject, isString } from 'class-validator';

import { RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { type ShareWithInput } from 'src/engine/api/common/types/share-with-input.type';
import {
  GraphqlDirectExecutionException,
  GraphqlDirectExecutionExceptionCode,
} from 'src/engine/api/graphql/direct-execution/errors/graphql-direct-execution.exception';

const ALLOWED_SHARE_WITH_ENTRY_KEYS = new Set([
  'workspaceMemberId',
  'roleId',
  'everyone',
  'accessLevel',
]);

const isOptionalString = (value: unknown): boolean =>
  !isDefined(value) || isString(value);

const isShareWithEntry = (entry: unknown): boolean =>
  isObject(entry) &&
  Object.keys(entry).every((key) => ALLOWED_SHARE_WITH_ENTRY_KEYS.has(key)) &&
  isOptionalString(Reflect.get(entry, 'workspaceMemberId')) &&
  isOptionalString(Reflect.get(entry, 'roleId')) &&
  (!isDefined(Reflect.get(entry, 'everyone')) ||
    isBoolean(Reflect.get(entry, 'everyone'))) &&
  isEnum(Reflect.get(entry, 'accessLevel'), RecordShareAccessLevel);

export function assertShareWithArg(
  shareWith: unknown,
): asserts shareWith is ShareWithInput[] | undefined {
  if (!isDefined(shareWith)) {
    return;
  }

  if (!Array.isArray(shareWith) || !shareWith.every(isShareWithEntry)) {
    throw new GraphqlDirectExecutionException(
      'Invalid argument: "shareWith" must be an array of objects with an accessLevel and one of workspaceMemberId, roleId or everyone',
      GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }
}
