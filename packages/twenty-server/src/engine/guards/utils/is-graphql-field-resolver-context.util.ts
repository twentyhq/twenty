import { type ExecutionContext } from '@nestjs/common';
import { type GqlContextType, GqlExecutionContext } from '@nestjs/graphql';

import { type GraphQLResolveInfo } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

// A root operation has no parent in the response path, a field resolver always has one
export const isGraphqlFieldResolverContext = (
  context: ExecutionContext,
): boolean => {
  if (context.getType<GqlContextType>() !== 'graphql') {
    return false;
  }

  const info = GqlExecutionContext.create(context).getInfo<
    GraphQLResolveInfo | undefined
  >();

  return isDefined(info?.path?.prev);
};
