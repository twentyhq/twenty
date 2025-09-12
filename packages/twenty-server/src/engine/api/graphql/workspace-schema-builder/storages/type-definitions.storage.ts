import { Injectable, Scope } from '@nestjs/common';

import {
  type GraphQLEnumType,
  type GraphQLInputObjectType,
  type GraphQLObjectType,
} from 'graphql';
import { type FieldMetadataType } from 'twenty-shared/types';

import {
  StoredEnumGqlType,
  StoredInputType,
  StoredObjectType,
} from 'src/engine/api/graphql/workspace-schema-builder/interfaces/stored-gql-type.interface';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';

// Must be scoped on REQUEST level, because we need to recreate it for each workspaces
// TODO: Implement properly durable by workspace
@Injectable({ scope: Scope.REQUEST, durable: true })
export class TypeDefinitionsStorage {
  private readonly enumTypes = new Map<string, StoredEnumGqlType>();
  private readonly objectTypes = new Map<string, StoredObjectType>();
  private readonly inputTypes = new Map<string, StoredInputType>();

  addEnumTypes(enumDefs: StoredEnumGqlType[]) {
    enumDefs.forEach((item) => this.enumTypes.set(item.key, item));
  }

  addObjectTypes(objectDefs: StoredObjectType[]) {
    objectDefs.forEach((item) => this.objectTypes.set(item.key, item));
  }

  getObjectTypeByKey(key: string): GraphQLObjectType | undefined {
    return this.objectTypes.get(key)?.type;
  }

  getAllObjectTypeDefinitions(): StoredObjectType[] {
    return Array.from(this.objectTypes.values());
  }

  addInputTypes(inputDefs: StoredInputType[]) {
    inputDefs.forEach((item) => this.inputTypes.set(item.key, item));
  }

  getInputTypeByKey(
    key: string,
  ): GraphQLInputObjectType | GraphQLEnumType | undefined {
    return this.inputTypes.get(key)?.type;
  }

  getEnumTypeByKey(key: string): GraphQLEnumType | undefined {
    return this.enumTypes.get(key)?.type;
  }

  getAllInputTypeDefinitions(): StoredInputType[] {
    return Array.from(this.inputTypes.values());
  }

  private generateCompositeKey(
    target: string | FieldMetadataType,
    kind: ObjectTypeDefinitionKind | GqlInputTypeDefinitionKind,
  ): string {
    return `${target.toString()}_${kind.toString()}`;
  }
}
