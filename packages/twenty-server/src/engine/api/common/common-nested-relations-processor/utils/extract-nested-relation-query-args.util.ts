import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { OrderByArgProcessorService } from 'src/engine/api/common/common-args-processors/order-by-arg-processor/order-by-arg-processor.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type CommonRelationSelection } from 'src/engine/api/common/types/common-selection.type';
import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';

type ExtractedNestedRelationQueryArgs = Pick<
  CommonRelationSelection,
  'filter' | 'orderBy' | 'first'
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

const parseFilter = (filter: unknown): ObjectRecordFilter | undefined => {
  if (!isDefined(filter)) {
    return undefined;
  }

  return isObjectRecordFilter(filter)
    ? filter
    : throwInvalidQueryInput('Invalid argument: "filter" must be an object');
};

const parseOrderBy = (orderBy: unknown): ObjectRecordOrderBy | undefined => {
  if (!isDefined(orderBy)) {
    return undefined;
  }

  return isObjectRecordOrderBy(orderBy)
    ? new OrderByArgProcessorService().process({ orderBy })
    : throwInvalidQueryInput('Invalid argument: "orderBy" must be an array');
};

const parseFirst = (first: unknown): number | undefined => {
  if (!isDefined(first)) {
    return undefined;
  }

  return isNonNegativeInteger(first)
    ? first
    : throwInvalidQueryInput(
        'Invalid argument: "first" must be a non-negative integer',
      );
};

// Cursor and offset arguments are accepted but ignored on nested relations, as they always were
export const extractNestedRelationQueryArgs = (
  graphqlArguments: Record<string, unknown>,
): ExtractedNestedRelationQueryArgs => {
  const unknownArgumentName = Object.keys(graphqlArguments).find(
    (argumentName) => !ALLOWED_ARGUMENT_NAMES.has(argumentName),
  );

  if (isDefined(unknownArgumentName)) {
    throwInvalidQueryInput(`Argument not allowed: ${unknownArgumentName}`);
  }

  return {
    filter: parseFilter(graphqlArguments.filter),
    orderBy: parseOrderBy(graphqlArguments.orderBy),
    first: parseFirst(graphqlArguments.first),
  };
};
