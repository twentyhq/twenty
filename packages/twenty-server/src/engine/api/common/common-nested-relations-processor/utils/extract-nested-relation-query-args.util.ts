import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type NestedRelationQueryArgs } from 'src/engine/api/common/common-nested-relations-processor/types/nested-relation-query-args.type';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';

type ExtractedNestedRelationQueryArgs = Omit<
  NestedRelationQueryArgs,
  'nestedRelationQueryArgsByFieldName'
>;

const ALLOWED_ARGUMENT_NAMES = new Set([
  'filter',
  'orderBy',
  'first',
  'last',
  'before',
  'after',
  'offset',
]);

const throwInvalidQueryInput = (message: string): never => {
  throw new CommonQueryRunnerException(
    message,
    CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
    { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
  );
};

const isObjectRecordFilter = (value: unknown): value is ObjectRecordFilter =>
  isPlainObject(value);

const isObjectRecordOrderBy = (
  value: unknown,
): value is ObjectRecordOrderBy | ObjectRecordOrderBy[number] =>
  Array.isArray(value) || isPlainObject(value);

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

// Cursor and offset arguments are accepted but ignored on nested relations, as they always were
export const extractNestedRelationQueryArgs = (
  graphqlArguments: Record<string, unknown> = {},
): ExtractedNestedRelationQueryArgs => {
  const unknownArgumentName = Object.keys(graphqlArguments).find(
    (argumentName) => !ALLOWED_ARGUMENT_NAMES.has(argumentName),
  );

  if (isDefined(unknownArgumentName)) {
    throwInvalidQueryInput(`Argument not allowed: ${unknownArgumentName}`);
  }

  const { filter, orderBy, first } = graphqlArguments;

  if (isDefined(filter) && !isObjectRecordFilter(filter)) {
    throwInvalidQueryInput('Invalid argument: "filter" must be an object');
  }

  if (isDefined(orderBy) && !isObjectRecordOrderBy(orderBy)) {
    throwInvalidQueryInput('Invalid argument: "orderBy" must be an array');
  }

  if (isDefined(first) && !isNonNegativeInteger(first)) {
    throwInvalidQueryInput(
      'Invalid argument: "first" must be a non-negative integer',
    );
  }

  return {
    ...(isObjectRecordFilter(filter) ? { filter } : {}),
    ...(isObjectRecordOrderBy(orderBy)
      ? { orderBy: Array.isArray(orderBy) ? orderBy : [orderBy] }
      : {}),
    ...(isNonNegativeInteger(first) ? { first } : {}),
  };
};
