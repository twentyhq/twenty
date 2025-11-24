import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  isObjectType,
} from 'graphql';
import { isDefined } from 'twenty-shared/utils';
import { CompositeType } from 'twenty-shared/types';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { computeCompositeFieldTypeOptions } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-composite-field-type-options.util';
import { computeCompositeFieldEnumTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-enum-type-key.util';
import { computeCompositeFieldInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-input-type-key.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class CompositeFieldMetadataUpdateGqlInputTypeGenerator {
  private readonly logger = new Logger(
    CompositeFieldMetadataUpdateGqlInputTypeGenerator.name,
  );
  constructor(
    private readonly gqlTypesStorage: GqlTypesStorage,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  public buildAndStore(compositeType: CompositeType) {
    const key = computeCompositeFieldInputTypeKey(
      compositeType.type,
      GqlInputTypeDefinitionKind.Update,
    );

    const type = new GraphQLInputObjectType({
      name: `${pascalCase(compositeType.type)}${GqlInputTypeDefinitionKind.Update.toString()}Input`,
      fields: this.generateFields(compositeType),
    });

    this.gqlTypesStorage.addGqlType(key, type);
  }

  public generateFields(
    compositeType: CompositeType,
  ): GraphQLInputFieldConfigMap {
    const fields: GraphQLInputFieldConfigMap = {};

    for (const property of compositeType.properties) {
      property.isRequired = false;
      // Relation fields are not supported in composite types
      if (isMorphOrRelationFieldMetadataType(property.type)) {
        this.logger.error(
          'Relation fields are not supported in composite types',
          { compositeType, property },
        );

        throw new Error('Relation fields are not supported in composite types');
      }

      // Skip hidden fields
      if (property.hidden === true || property.hidden === 'input') {
        continue;
      }

      const key = computeCompositeFieldEnumTypeKey(
        compositeType.type,
        property.name,
      );

      const typeOptions = computeCompositeFieldTypeOptions(property);

      const type = isEnumFieldMetadataType(property.type)
        ? this.gqlTypesStorage.getGqlTypeByKey(key)
        : this.typeMapperService.mapToScalarType(property.type, typeOptions);

      if (!isDefined(type) || isObjectType(type)) {
        const message = `Could not find a GraphQL input type for ${compositeType.type} ${property.name}`;

        this.logger.error(message, {
          type,
          typeOptions,
        });

        throw new Error(message);
      }

      const modifiedType = this.typeMapperService.applyTypeOptions(
        type,
        typeOptions,
      );

      fields[property.name] = {
        type: modifiedType,
        description: property.description,
      };
    }

    return fields;
  }
}
