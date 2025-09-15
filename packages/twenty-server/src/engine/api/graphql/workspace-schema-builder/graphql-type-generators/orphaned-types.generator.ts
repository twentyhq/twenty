import { Injectable } from '@nestjs/common';

import { GraphQLNamedType } from 'graphql';

import { GqlOperation } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-operation.enum';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';

@Injectable()
export class OrphanedTypesGenerator {
  constructor(private readonly gqlTypesStorage: GqlTypesStorage) {}

  fetchOrphanedTypes(): GraphQLNamedType[] {
    return this.gqlTypesStorage.getAllGqlTypesExcept([
      GqlOperation.Query,
      GqlOperation.Mutation,
    ]);
  }
}
