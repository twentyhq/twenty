import { Injectable, Scope } from '@nestjs/common';

import {
  type GraphQLEnumType,
  type GraphQLInputObjectType,
  type GraphQLObjectType,
} from 'graphql';

// Must be scoped on REQUEST level, because we need to recreate it for each workspaces
// TODO: Implement properly durable by workspace
@Injectable({ scope: Scope.REQUEST, durable: true })
export class GqlTypesStorage {
  private readonly gqlTypes = new Map<
    string,
    GraphQLEnumType | GraphQLInputObjectType | GraphQLObjectType
  >();

  addGqlType(
    key: string,
    type: GraphQLEnumType | GraphQLInputObjectType | GraphQLObjectType,
  ) {
    this.gqlTypes.set(key, type);
  }

  getGqlTypeByKey(
    key: string,
  ): GraphQLEnumType | GraphQLInputObjectType | GraphQLObjectType | undefined {
    return this.gqlTypes.get(key);
  }

  getAllGqlTypesExcept(
    keysToExclude: string[],
  ): (GraphQLEnumType | GraphQLInputObjectType | GraphQLObjectType)[] {
    return Array.from(this.gqlTypes.entries())
      .filter(([key]) => !keysToExclude.includes(key))
      .map(([, value]) => value);
  }
}
