import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { FieldInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/field-input-type.generator';
import { FieldObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/field-object-type.generator';
import {
  TypeMapperService,
  TypeOptions,
} from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';
import { computeRelationConnectInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-relation-connect-input-type-key.util';
import { extractGraphQLRelationFieldNames } from 'src/engine/api/graphql/workspace-schema-builder/utils/extract-graphql-relation-field-names.util';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

@Injectable()
export class RelationFieldTypeGenerator {
  constructor(
    private readonly fieldObjectTypeGenerator: FieldObjectTypeGenerator,
    private readonly fieldInputTypeGenerator: FieldInputTypeGenerator,
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  generateRelationFieldObjectType({
    fieldMetadata,
    buildOptions,
    typeOptions,
  }: {
    fieldMetadata: FieldMetadataEntity<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >;
    buildOptions: WorkspaceBuildSchemaOptions;
    typeOptions: TypeOptions;
  }) {
    return this.generateSimpleRelationFieldObjectType({
      fieldMetadata,
      buildOptions,
      typeOptions,
    });
  }

  generateRelationFieldInputType({
    fieldMetadata,
    kind,
    buildOptions,
    typeOptions,
  }: {
    fieldMetadata: FieldMetadataEntity<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >;
    kind: GqlInputTypeDefinitionKind;
    buildOptions: WorkspaceBuildSchemaOptions;
    typeOptions: TypeOptions;
  }) {
    switch (kind) {
      case GqlInputTypeDefinitionKind.Filter:
      case GqlInputTypeDefinitionKind.OrderBy:
        return this.generateSimpleRelationFieldInputType({
          fieldMetadata,
          kind,
          buildOptions,
          typeOptions,
        });

      case GqlInputTypeDefinitionKind.Create:
      case GqlInputTypeDefinitionKind.Update:
        return {
          ...this.generateConnectRelationFieldInputType({
            fieldMetadata,
            typeOptions,
          }),
          ...this.generateSimpleRelationFieldInputType({
            fieldMetadata,
            kind,
            buildOptions,
            typeOptions,
          }),
        };

      default:
        throw new Error(`Invalid input type kind: ${kind}`);
    }
  }

  private generateSimpleRelationFieldObjectType({
    fieldMetadata,
    buildOptions,
    typeOptions,
  }: {
    fieldMetadata: FieldMetadataEntity<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >;
    buildOptions: WorkspaceBuildSchemaOptions;
    typeOptions: TypeOptions;
  }) {
    if (fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY)
      return {};

    const { joinColumnName } = extractGraphQLRelationFieldNames(fieldMetadata);

    return {
      [joinColumnName]: {
        type: this.fieldObjectTypeGenerator.generate({
          type: fieldMetadata.type,
          buildOptions,
          typeOptions,
          key: undefined,
        }),
        description: fieldMetadata.description,
      },
    };
  }

  private generateSimpleRelationFieldInputType({
    fieldMetadata,
    kind,
    buildOptions,
    typeOptions,
  }: {
    fieldMetadata: FieldMetadataEntity<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >;
    kind: GqlInputTypeDefinitionKind;
    buildOptions: WorkspaceBuildSchemaOptions;
    typeOptions: TypeOptions;
  }) {
    if (fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY)
      return {};

    const { joinColumnName } = extractGraphQLRelationFieldNames(fieldMetadata);

    return {
      [joinColumnName]: {
        type: this.fieldInputTypeGenerator.generate({
          type: fieldMetadata.type,
          kind,
          buildOptions,
          typeOptions,
          key: undefined,
        }),
        description: fieldMetadata.description,
      },
    };
  }

  private generateConnectRelationFieldInputType({
    fieldMetadata,
    typeOptions,
  }: {
    fieldMetadata: FieldMetadataEntity<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >;
    typeOptions: TypeOptions;
  }) {
    if (
      fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY ||
      //TODO : Enable connect on morph relation - @guillim
      fieldMetadata.type === FieldMetadataType.MORPH_RELATION
    ) {
      return {};
    }

    const { fieldMetadataName } =
      extractGraphQLRelationFieldNames(fieldMetadata);

    if (!isDefined(fieldMetadata.relationTargetObjectMetadataId)) {
      throw new Error(
        `Target object metadata not found for field metadata ${fieldMetadata.id}`,
      );
    }

    const key = computeRelationConnectInputTypeKey(
      fieldMetadata.relationTargetObjectMetadataId,
    );

    const type = this.typeDefinitionsStorage.getInputTypeByKey(key);

    if (!type) {
      throw new Error(`Input type ${key} not found`);
    }

    return {
      [fieldMetadataName]: {
        type: this.typeMapperService.mapToGqlType(type, typeOptions),
        description: fieldMetadata.description,
      },
    };
  }
}
