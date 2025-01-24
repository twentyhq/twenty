import { Injectable, Scope } from '@nestjs/common';

import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLObjectType,
} from 'graphql';
import { FieldMetadataType } from 'twenty-shared';

import { EnumTypeDefinition } from 'src/engine/api/graphql/workspace-schema-builder/factories/enum-type-definition.factory';
import {
  InputTypeDefinition,
  InputTypeDefinitionKind,
} from 'src/engine/api/graphql/workspace-schema-builder/factories/input-type-definition.factory';
import {
  ObjectTypeDefinition,
  ObjectTypeDefinitionKind,
} from 'src/engine/api/graphql/workspace-schema-builder/factories/object-type-definition.factory';

export type GqlInputType = InputTypeDefinition | EnumTypeDefinition;

export type GqlOutputType = ObjectTypeDefinition | EnumTypeDefinition;

// Must be scoped on REQUEST level, because we need to recreate it for each workspaces
// TODO: Implement properly durable by workspace
@Injectable({ scope: Scope.REQUEST, durable: true })
export class TypeDefinitionsStorage {
  private readonly enumTypeDefinitions = new Map<string, EnumTypeDefinition>();
  private readonly objectTypeDefinitions = new Map<
    string,
    ObjectTypeDefinition
  >();
  private readonly inputTypeDefinitions = new Map<
    string,
    InputTypeDefinition
  >();

  addEnumTypes(enumDefs: EnumTypeDefinition[]) {
    enumDefs.forEach((item) => this.enumTypeDefinitions.set(item.target, item));
  }

  addObjectTypes(objectDefs: ObjectTypeDefinition[]) {
    objectDefs.forEach((item) =>
      this.objectTypeDefinitions.set(
        this.generateCompositeKey(item.target, item.kind),
        item,
      ),
    );
  }

  getObjectTypeByKey(
    target: string,
    kind: ObjectTypeDefinitionKind,
  ): GraphQLObjectType | undefined {
    return this.objectTypeDefinitions.get(
      this.generateCompositeKey(target, kind),
    )?.type;
  }

  getAllObjectTypeDefinitions(): ObjectTypeDefinition[] {
    return Array.from(this.objectTypeDefinitions.values());
  }

  addInputTypes(inputDefs: InputTypeDefinition[]) {
    inputDefs.forEach((item) =>
      this.inputTypeDefinitions.set(
        this.generateCompositeKey(item.target, item.kind),
        item,
      ),
    );
  }

  getInputTypeByKey(
    target: string,
    kind: InputTypeDefinitionKind,
  ): GraphQLInputObjectType | GraphQLEnumType | undefined {
    const key = this.generateCompositeKey(target, kind);
    let definition: GqlInputType | undefined;

    definition ??= this.inputTypeDefinitions.get(key);
    definition ??= this.enumTypeDefinitions.get(target);

    return definition?.type;
  }

  getOutputTypeByKey(
    target: string,
    kind: ObjectTypeDefinitionKind,
  ): GraphQLObjectType | GraphQLEnumType | undefined {
    const key = this.generateCompositeKey(target, kind);
    let definition: GqlOutputType | undefined;

    definition ??= this.objectTypeDefinitions.get(key);
    definition ??= this.enumTypeDefinitions.get(target);

    return definition?.type;
  }

  getEnumTypeByKey(target: string): GraphQLEnumType | undefined {
    return this.enumTypeDefinitions.get(target)?.type;
  }

  getAllInputTypeDefinitions(): InputTypeDefinition[] {
    return Array.from(this.inputTypeDefinitions.values());
  }

  private generateCompositeKey(
    target: string | FieldMetadataType,
    kind: ObjectTypeDefinitionKind | InputTypeDefinitionKind,
  ): string {
    return `${target.toString()}_${kind.toString()}`;
  }
}
