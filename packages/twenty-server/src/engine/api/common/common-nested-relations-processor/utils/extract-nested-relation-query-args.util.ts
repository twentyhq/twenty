import { msg } from '@lingui/core/macro';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type NestedRelationQueryArgs } from 'src/engine/api/common/common-nested-relations-processor/types/nested-relation-query-args.type';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

type ExtractedNestedRelationQueryArgs = Omit<
  NestedRelationQueryArgs,
  'nestedRelationQueryArgsByFieldName'
>;

const isObjectRecordFilter = (value: unknown): value is ObjectRecordFilter =>
  isPlainObject(value);

const isObjectRecordOrderBy = (
  value: unknown,
): value is ObjectRecordOrderBy | ObjectRecordOrderBy[number] =>
  Array.isArray(value) || isPlainObject(value);

const throwInvalidNestedRelationArgument = (argumentName: string): never => {
  throw new GraphqlQueryRunnerException(
    `Argument "${argumentName}" is not supported on a nested relation: use filter, orderBy or first`,
    GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
    {
      userFriendlyMessage: msg`This argument is not supported on related records.`,
    },
  );
};

// graphqlFields' processArguments output: one { [argumentName]: { kind, value } } entry per argument
export const extractNestedRelationQueryArgs = (
  graphqlArguments: unknown,
): ExtractedNestedRelationQueryArgs => {
  if (!Array.isArray(graphqlArguments)) {
    return {};
  }

  const extractedArgs: ExtractedNestedRelationQueryArgs = {};

  for (const graphqlArgument of graphqlArguments) {
    if (!isPlainObject(graphqlArgument)) {
      continue;
    }

    for (const [argumentName, argument] of Object.entries(graphqlArgument)) {
      const value = isPlainObject(argument) ? argument.value : undefined;

      if (!isDefined(value)) {
        continue;
      }

      if (argumentName === 'filter' && isObjectRecordFilter(value)) {
        extractedArgs.filter = value;
        continue;
      }

      if (argumentName === 'orderBy' && isObjectRecordOrderBy(value)) {
        extractedArgs.orderBy = Array.isArray(value) ? value : [value];
        continue;
      }

      if (
        argumentName === 'first' &&
        typeof value === 'number' &&
        Number.isInteger(value) &&
        value > 0
      ) {
        extractedArgs.first = value;
        continue;
      }

      throwInvalidNestedRelationArgument(argumentName);
    }
  }

  return extractedArgs;
};
