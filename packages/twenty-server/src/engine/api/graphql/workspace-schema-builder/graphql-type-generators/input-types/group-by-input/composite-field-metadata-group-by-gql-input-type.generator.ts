import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLBoolean,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
} from 'graphql';
import { CompositeType } from 'twenty-shared/types';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { computeCompositeFieldInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-input-type-key.util';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class CompositeFieldMetadataGroupByGqlInputTypeGenerator {
  private readonly logger = new Logger(
    CompositeFieldMetadataGroupByGqlInputTypeGenerator.name,
  );
  constructor(
    private readonly gqlTypesStorage: GqlTypesStorage,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  public buildAndStore(compositeType: CompositeType) {
    const key = computeCompositeFieldInputTypeKey(
      compositeType.type,
      GqlInputTypeDefinitionKind.GroupBy,
    );

    const type = new GraphQLInputObjectType({
      name: `${pascalCase(compositeType.type)}${GqlInputTypeDefinitionKind.GroupBy.toString()}Input`,
      fields: this.generateFields(compositeType),
    });

    this.gqlTypesStorage.addGqlType(key, type);
  }

  public generateFields(
    compositeType: CompositeType,
  ): GraphQLInputFieldConfigMap {
    const fields: GraphQLInputFieldConfigMap = {};

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
      if (property.hidden === true) {
        continue;
      }

      const type = this.typeMapperService.applyTypeOptions(GraphQLBoolean, {});

      fields[property.name] = {
        type,
        description: property.description,
      };
    }

    return fields;
  }
}
