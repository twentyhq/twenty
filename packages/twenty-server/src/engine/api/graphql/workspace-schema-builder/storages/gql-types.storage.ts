import { type GraphQLNamedType } from 'graphql';

export class GqlTypesStorage {
  private readonly gqlTypes = new Map<string, GraphQLNamedType>();

  addGqlType(key: string, type: GraphQLNamedType) {
    this.gqlTypes.set(key, type);
  }

  getGqlTypeByKey<T extends GraphQLNamedType = GraphQLNamedType>(
    key: string,
  ): T | undefined {
    return this.gqlTypes.get(key) as T | undefined;
  }

  getAllGqlTypesExcept(keysToExclude: string[]): GraphQLNamedType[] {
    return Array.from(this.gqlTypes.entries())
      .filter(([key]) => !keysToExclude.includes(key))
      .map(([, value]) => value);
  }

  getDuplicateGqlTypeNames(): Record<string, string[]> {
    const keysByTypeName = new Map<string, string[]>();

    for (const [key, type] of this.gqlTypes.entries()) {
      const keys = keysByTypeName.get(type.name) ?? [];

      keys.push(key);
      keysByTypeName.set(type.name, keys);
    }

    return Object.fromEntries(
      Array.from(keysByTypeName.entries()).filter(([, keys]) => keys.length > 1),
    );
  }
}
