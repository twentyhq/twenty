import { Injectable } from '@nestjs/common';

import { type GraphQLNamedType } from 'graphql';

import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';

@Injectable()
export class OrphanedTypesGenerator {
  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public generate(): GraphQLNamedType[] {
    const objectTypes =
      this.typeDefinitionsStorage.getAllObjectTypeDefinitions();
    const inputTypes = this.typeDefinitionsStorage.getAllInputTypeDefinitions();
    const classTypes = [...objectTypes, ...inputTypes];

    return [...classTypes.map(({ type }) => type)];
  }
}
