import { Injectable, Logger } from '@nestjs/common';

import { GraphQLInputType } from 'graphql';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import {
  TypeMapperService,
  TypeOptions,
} from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';

import { InputTypeDefinitionKind } from './input-type-definition.factory';

@Injectable()
export class OrderByTypeFactory {
  private readonly logger = new Logger(OrderByTypeFactory.name);

  constructor(
    private readonly typeMapperService: TypeMapperService,
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public create(
    fieldMetadata: FieldMetadataInterface,
    buildOtions: WorkspaceBuildSchemaOptions,
    typeOptions: TypeOptions,
  ): GraphQLInputType {
    const target = isCompositeFieldMetadataType(fieldMetadata.type)
      ? fieldMetadata.type.toString()
      : fieldMetadata.id;
    let orderByType = this.typeMapperService.mapToOrderByType(
      fieldMetadata.type,
    );

    orderByType ??= this.typeDefinitionsStorage.getInputTypeByKey(
      target,
      InputTypeDefinitionKind.OrderBy,
    );

    if (!orderByType) {
      this.logger.error(`Could not find a GraphQL type for ${target}`, {
        fieldMetadata,
        buildOtions,
        typeOptions,
      });

      throw new Error(`Could not find a GraphQL type for ${target}`);
    }

    return this.typeMapperService.mapToGqlType(orderByType, typeOptions);
  }
}
