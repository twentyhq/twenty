import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLBoolean,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  isInputObjectType,
} from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { RelationFieldMetadataGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/relation-field-metadata-gql-type.generator';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { computeCompositeFieldInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-input-type-key.util';
import { computeObjectMetadataInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-input-type.util';
import { isFieldMetadataRelationOrMorphRelation } from 'src/engine/api/graphql/workspace-schema-builder/utils/is-field-metadata-relation-or-morph-relation.utils';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class ObjectMetadataGroupByGqlInputTypeGenerator {
  private readonly logger = new Logger(
    ObjectMetadataGroupByGqlInputTypeGenerator.name,
  );
  constructor(
    private readonly gqlTypesStorage: GqlTypesStorage,
    private readonly relationFieldMetadataGqlInputTypeGenerator: RelationFieldMetadataGqlInputTypeGenerator,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  public buildAndStore(objectMetadata: ObjectMetadataEntity) {
    const inputType = new GraphQLInputObjectType({
      name: `${pascalCase(objectMetadata.nameSingular)}${GqlInputTypeDefinitionKind.GroupBy.toString()}Input`,
      description: objectMetadata.description,
      fields: () => this.generateFields(objectMetadata),
    }) as GraphQLInputObjectType;

    const key = computeObjectMetadataInputTypeKey(
      objectMetadata.nameSingular,
      GqlInputTypeDefinitionKind.GroupBy,
    );

    this.gqlTypesStorage.addGqlType(key, inputType);
  }

  private generateFields(
    objectMetadata: ObjectMetadataEntity,
  ): GraphQLInputFieldConfigMap {
    const allGeneratedFields: GraphQLInputFieldConfigMap = {};

    for (const fieldMetadata of objectMetadata.fields) {
      const generatedField = isFieldMetadataRelationOrMorphRelation(
        fieldMetadata,
      )
        ? this.relationFieldMetadataGqlInputTypeGenerator.generateSimpleRelationFieldGroupByInputType(
            fieldMetadata,
          )
        : this.generateField(fieldMetadata);

      Object.assign(allGeneratedFields, generatedField);
    }

    return allGeneratedFields;
  }

  private generateField(fieldMetadata: FieldMetadataEntity) {
    let type: GraphQLInputObjectType | typeof GraphQLBoolean | undefined;

    if (isCompositeFieldMetadataType(fieldMetadata.type)) {
      const key = computeCompositeFieldInputTypeKey(
        fieldMetadata.type,
        GqlInputTypeDefinitionKind.GroupBy,
      );

      const compositeType = this.gqlTypesStorage.getGqlTypeByKey(key);

      if (!isDefined(compositeType) || !isInputObjectType(compositeType)) {
        const message = `Could not find a GraphQL input type for ${fieldMetadata.type} field metadata`;

        this.logger.error(message, {
          type,
        });
        throw new Error(message);
      }

      type = compositeType;
    } else {
      type = this.typeMapperService.applyTypeOptions(GraphQLBoolean, {});
    }

    return {
      [fieldMetadata.name]: {
        type,
        description: fieldMetadata.description,
      },
    };
  }
}
