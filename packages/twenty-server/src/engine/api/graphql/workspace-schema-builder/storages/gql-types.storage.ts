import {
  type GraphQLEnumType,
  type GraphQLInputObjectType,
  type GraphQLObjectType,
} from 'graphql';

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

  getGqlTypeByKey<
    T extends GraphQLEnumType | GraphQLInputObjectType | GraphQLObjectType =
      | GraphQLEnumType
      | GraphQLInputObjectType
      | GraphQLObjectType,
  >(key: string): T | undefined {
    return this.gqlTypes.get(key) as T | undefined;
  }

  getAllGqlTypesExcept(
    keysToExclude: string[],
  ): (GraphQLEnumType | GraphQLInputObjectType | GraphQLObjectType)[] {
    return Array.from(this.gqlTypes.entries())
      .filter(([key]) => !keysToExclude.includes(key))
      .map(([, value]) => value);
  }
}
