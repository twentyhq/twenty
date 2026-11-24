// oxlint-disable twenty/graphql-resolvers-should-be-guarded, twenty/graphql-field-resolvers-should-declare-access
import { Catch, type ExceptionFilter, UseFilters } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import {
  Field,
  ObjectType,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import {
  ErrorCode,
  ForbiddenError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { runQueryOnGraphqlApp } from 'src/engine/guards/__tests__/run-guarded-query.test-util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/permissions/utils/permissions-graphql-api-exception.filter';

class ResolverClassException extends Error {}

@Catch(ResolverClassException)
class ResolverClassExceptionFilter implements ExceptionFilter {
  catch(exception: ResolverClassException) {
    throw new UserInputError(exception.message);
  }
}

@ObjectType('FilteredParent')
class FilteredParent {
  @Field(() => String)
  id: string;
}

const throwPermissionDenied = (): never => {
  throw new PermissionsException(
    'Permission denied',
    PermissionsExceptionCode.PERMISSION_DENIED,
  );
};

@Resolver(() => FilteredParent)
@UseFilters(ResolverClassExceptionFilter)
class FilteredResolver {
  @Query(() => FilteredParent)
  parent(): FilteredParent {
    return { id: 'parent-id' };
  }

  @Query(() => String)
  rootDeniedByPermissions(): string {
    return throwPermissionDenied();
  }

  @ResolveField(() => String)
  deniedByPermissions(): string {
    return throwPermissionDenied();
  }

  @ResolveField(() => String)
  rejectedByResolverClassFilter(): string {
    throw new ResolverClassException('Rejected by the resolver class filter');
  }

  @ResolveField(() => String)
  failingWithoutFilter(): string {
    throw new Error('No filter catches this');
  }
}

const runQuery = (source: string) =>
  runQueryOnGraphqlApp({
    resolver: FilteredResolver,
    source,
    request: {},
    providers: [
      { provide: APP_FILTER, useClass: PermissionsGraphqlApiExceptionFilter },
    ],
  });

describe('exception filters on GraphQL field resolvers', () => {
  it('should map an exception thrown by a field resolver with a global filter, as on a root operation', async () => {
    const fieldResult = await runQuery('{ parent { id deniedByPermissions } }');
    const rootResult = await runQuery('{ rootDeniedByPermissions }');

    const fieldError = fieldResult.errors?.[0];
    const rootError = rootResult.errors?.[0];

    expect(fieldResult.errors).toHaveLength(1);
    expect(fieldError?.path).toEqual(['parent', 'deniedByPermissions']);
    expect(fieldError?.originalError).toBeInstanceOf(ForbiddenError);
    expect(fieldError?.extensions).toMatchObject({
      code: ErrorCode.FORBIDDEN,
      subCode: PermissionsExceptionCode.PERMISSION_DENIED,
    });
    expect(fieldError?.message).toBe(rootError?.message);
    expect(fieldError?.extensions).toEqual(rootError?.extensions);
  });

  it('should apply the filters declared on the resolver class to its field resolvers', async () => {
    const result = await runQuery(
      '{ parent { id rejectedByResolverClassFilter } }',
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors?.[0]?.originalError).toBeInstanceOf(UserInputError);
  });

  it('should still report an exception no filter maps instead of resolving the field to null', async () => {
    const result = await runQuery('{ parent { id failingWithoutFilter } }');

    expect(result.errors).toHaveLength(1);
    expect(result.errors?.[0]?.message).toBe('No filter catches this');
    expect(result.errors?.[0]?.path).toEqual([
      'parent',
      'failingWithoutFilter',
    ]);
  });
});
