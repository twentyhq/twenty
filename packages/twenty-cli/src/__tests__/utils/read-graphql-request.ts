import { isString } from '@sniptt/guards';
import { Kind, parse, valueFromASTUntyped } from 'graphql';
import { isPlainObject } from 'twenty-shared/utils';

import { type RecordedRequest } from '@/__tests__/utils/start-test-server';

export const readGraphqlRequest = (request: Pick<RecordedRequest, 'body'>) => {
  const body: unknown = JSON.parse(request.body);
  const query = isPlainObject(body) && isString(body.query) ? body.query : '';
  const variables =
    isPlainObject(body) && isPlainObject(body.variables) ? body.variables : {};
  const operation = parse(query).definitions.find(
    (definition) => definition.kind === Kind.OPERATION_DEFINITION,
  );
  const field = operation?.selectionSet.selections.find(
    (selection) => selection.kind === Kind.FIELD,
  );

  return {
    query,
    arguments: Object.fromEntries(
      (field?.arguments ?? []).map((argument) => [
        argument.name.value,
        valueFromASTUntyped(argument.value, variables),
      ]),
    ) as Record<string, unknown>,
  };
};
