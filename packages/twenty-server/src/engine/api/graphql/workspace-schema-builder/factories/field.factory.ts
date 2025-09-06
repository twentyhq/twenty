import { Injectable } from '@nestjs/common';

import {
  type GraphQLFieldConfigMap,
  type GraphQLInputFieldConfigMap,
} from 'graphql';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { InputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/factories/input-type-definition.factory';
import { InputTypeFactory } from 'src/engine/api/graphql/workspace-schema-builder/factories/input-type.factory';
import { type ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/factories/object-type-definition.factory';
import { OutputTypeFactory } from 'src/engine/api/graphql/workspace-schema-builder/factories/output-type.factory';
import { formatRelationConnectInputTarget } from 'src/engine/api/graphql/workspace-schema-builder/factories/relation-connect-input-type-definition.factory';
import { extractGraphQLRelationFieldNames } from 'src/engine/api/graphql/workspace-schema-builder/utils/extract-graphql-relation-field-names.util';
import { isFieldMetadataRelationOrMorphRelation } from 'src/engine/api/graphql/workspace-schema-builder/utils/is-field-metadata-relation-or-morph-relation.utils';
import { isInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/utils/is-input-type-definition-kind.util';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Injectable()
export class FieldFactory {
  constructor(
    private readonly inputTypeFactory: InputTypeFactory,
    private readonly outputTypeFactory: OutputTypeFactory,
  ) {}

  create = <T extends InputTypeDefinitionKind | ObjectTypeDefinitionKind>({
    objectMetadata,
    kind,
    options,
  }: {
    objectMetadata: ObjectMetadataEntity;
    kind: T;
    options: WorkspaceBuildSchemaOptions;
  }): T extends InputTypeDefinitionKind
    ? GraphQLInputFieldConfigMap
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      GraphQLFieldConfigMap<any, any> => {
    const allGeneratedFields = {};

    for (const fieldMetadata of objectMetadata.fields) {
      let generatedField;

      const isRelation = isFieldMetadataRelationOrMorphRelation(fieldMetadata);

      if (isRelation) {
        generatedField = this.generateRelationField({
          fieldMetadata: fieldMetadata as FieldMetadataEntity<
            FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
          >,
          kind,
          options,
        });
      } else {
        generatedField = this.generateField({
          fieldMetadata,
          kind,
          options,
        });
      }

      Object.assign(allGeneratedFields, generatedField);
    }

    return allGeneratedFields;
  };

  getTarget = <T extends FieldMetadataType>(
    fieldMetadata: FieldMetadataEntity<T>,
  ) => {
    return isCompositeFieldMetadataType(fieldMetadata.type)
      ? fieldMetadata.type.toString()
      : fieldMetadata.id;
  };

  getTypeFactoryOptions = <T extends FieldMetadataType>(
    fieldMetadata: FieldMetadataEntity<T>,
    kind: InputTypeDefinitionKind | ObjectTypeDefinitionKind,
  ) => {
    return isInputTypeDefinitionKind(kind)
      ? {
          nullable: fieldMetadata.isNullable ?? undefined,
          defaultValue: fieldMetadata.defaultValue,
          isArray:
            kind !== InputTypeDefinitionKind.Filter &&
            fieldMetadata.type === FieldMetadataType.MULTI_SELECT,
          settings: fieldMetadata.settings,
          isIdField: fieldMetadata.name === 'id',
        }
      : {
          nullable: fieldMetadata.isNullable ?? undefined,
          isArray: fieldMetadata.type === FieldMetadataType.MULTI_SELECT,
          settings: fieldMetadata.settings,
          // Scalar type is already defined in the entity itself.
          isIdField: false,
        };
  };

  generateField = <
    T extends InputTypeDefinitionKind | ObjectTypeDefinitionKind,
  >({
    fieldMetadata,
    kind,
    options,
  }: {
    fieldMetadata: FieldMetadataEntity;
    kind: T;
    options: WorkspaceBuildSchemaOptions;
  }) => {
    const type = this.getType(
      this.getTarget(fieldMetadata),
      kind,
      fieldMetadata,
      options,
    );

    return {
      [fieldMetadata.name]: {
        type,
        description: fieldMetadata.description,
      },
    };
  };

  generateRelationField = <
    T extends InputTypeDefinitionKind | ObjectTypeDefinitionKind,
  >({
    fieldMetadata,
    kind,
    options,
  }: {
    fieldMetadata: FieldMetadataEntity<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >;
    kind: T;
    options: WorkspaceBuildSchemaOptions;
  }) => {
    const relationFields = {};

    if (fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY) {
      return relationFields;
    }

    const { joinColumnName, fieldMetadataName } =
      extractGraphQLRelationFieldNames(fieldMetadata);

    let type = this.getType(
      this.getTarget(fieldMetadata),
      kind,
      fieldMetadata,
      options,
    );

    // @ts-expect-error legacy noImplicitAny
    relationFields[joinColumnName] = {
      type,
      description: fieldMetadata.description,
    };

    //TODO : temporary - continue ej/1278 branch (https://github.com/twentyhq/core-team-issues/issues/1278 issue) before removing this
    if (fieldMetadata.type === FieldMetadataType.MORPH_RELATION)
      return relationFields;

    if (
      [InputTypeDefinitionKind.Create, InputTypeDefinitionKind.Update].includes(
        kind as InputTypeDefinitionKind,
      ) &&
      isDefined(fieldMetadata.relationTargetObjectMetadataId)
    ) {
      type = this.getType(
        formatRelationConnectInputTarget(
          fieldMetadata.relationTargetObjectMetadataId,
        ),
        kind,
        fieldMetadata,
        options,
        {
          isRelationConnectField: true,
        },
      );

      // todo @guillim
      // @ts-expect-error legacy noImplicitAny
      relationFields[fieldMetadataName] = {
        type: type,
        description: fieldMetadata.description,
      };
    }

    return relationFields;
  };

  private getType = <
    T extends InputTypeDefinitionKind | ObjectTypeDefinitionKind,
    F extends FieldMetadataType = FieldMetadataType,
  >(
    target: string,
    kind: T,
    fieldMetadata: FieldMetadataEntity<F>,
    options: WorkspaceBuildSchemaOptions,
    typeFactoryOptionsOverride?: Record<string, unknown>,
  ) => {
    const typeFactoryOptions = {
      ...this.getTypeFactoryOptions(fieldMetadata, kind),
      ...typeFactoryOptionsOverride,
    };

    return isInputTypeDefinitionKind(kind)
      ? this.inputTypeFactory.create(
          target,
          fieldMetadata.type,
          kind,
          options,
          typeFactoryOptions,
        )
      : this.outputTypeFactory.create(
          target,
          fieldMetadata.type,
          kind,
          options,
          typeFactoryOptions,
        );
  };
}
