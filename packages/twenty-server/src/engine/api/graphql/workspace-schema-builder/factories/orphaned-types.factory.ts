import { Injectable } from '@nestjs/common';

import { GraphQLNamedType } from 'graphql';

import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';

@Injectable()
export class OrphanedTypesFactory {
  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public create(): GraphQLNamedType[] {
    const objectTypeDefs =
      this.typeDefinitionsStorage.getAllObjectTypeDefinitions();
    const inputTypeDefs =
      this.typeDefinitionsStorage.getAllInputTypeDefinitions();
    const classTypeDefs = [...objectTypeDefs, ...inputTypeDefs];

    return [...classTypeDefs.map(({ type }) => type)];
  }
}
