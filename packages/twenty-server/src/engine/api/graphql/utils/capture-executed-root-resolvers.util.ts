import { type Request } from 'express';
import { type FieldNode } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

export const captureExecutedRootResolvers = ({
  request,
  topLevelFields,
}: {
  request: Request | undefined;
  topLevelFields: FieldNode[];
}): void => {
  if (!isDefined(request) || isDefined(request.executedRootResolvers)) {
    return;
  }

  request.executedRootResolvers = topLevelFields
    .map((field) => field.name.value)
    .filter((name) => !name.startsWith('__'));
};
