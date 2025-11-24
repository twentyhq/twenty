import { Injectable, Logger } from '@nestjs/common';

import { GraphQLObjectType, isInputObjectType } from 'graphql';
import { FieldMetadataType, type CompositeType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { GraphQLOutputTypeFieldConfigMap } from 'src/engine/api/graphql/workspace-schema-builder/types/graphql-field-config-map.types';
import { computeCompositeFieldEnumTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-enum-type-key.util';
import { computeCompositeFieldObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-object-type-key.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class CompositeFieldMetadataGqlObjectTypeGenerator {
  private readonly logger = new Logger(
    CompositeFieldMetadataGqlObjectTypeGenerator.name,
  );

  constructor(
    private readonly gqlTypesStorage: GqlTypesStorage,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  public buildAndStore(compositeType: CompositeType) {
    const kind = ObjectTypeDefinitionKind.Plain;
    const key = computeCompositeFieldObjectTypeKey(compositeType.type);

    const type = new GraphQLObjectType({
      name: `${pascalCase(compositeType.type)}${kind.toString()}`,
      fields: this.generateFields(compositeType),
    });

    this.gqlTypesStorage.addGqlType(key, type);
  }

  private generateFields(
    compositeType: CompositeType,
  ): GraphQLOutputTypeFieldConfigMap {
    const fields: GraphQLOutputTypeFieldConfigMap = {};

    for (const property of compositeType.properties) {
      // Relation fields are not supported in composite types
      if (isMorphOrRelationFieldMetadataType(property.type)) {
        this.logger.error(
          'Relation fields are not supported in composite types',
          { compositeType, property },
        );

        throw new Error('Relation fields are not supported in composite types');
      }

      // Skip hidden fields
      if (property.hidden === true || property.hidden === 'output') {
        continue;
      }

      const typeOptions = {
        nullable: !property.isRequired,
        isArray:
          property.type === FieldMetadataType.MULTI_SELECT || property.isArray,
      };

      const key = computeCompositeFieldEnumTypeKey(
        compositeType.type,
        property.name,
      );

      const type = isEnumFieldMetadataType(property.type)
        ? this.gqlTypesStorage.getGqlTypeByKey(key)
        : this.typeMapperService.mapToScalarType(property.type, typeOptions);

      if (!isDefined(type) || isInputObjectType(type)) {
        const message = `Could not find a GraphQL object type for ${compositeType.type} ${property.name}`;

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
