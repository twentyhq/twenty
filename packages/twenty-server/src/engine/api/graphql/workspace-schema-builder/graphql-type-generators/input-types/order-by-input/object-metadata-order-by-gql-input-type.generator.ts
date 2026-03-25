import { Injectable, Logger } from '@nestjs/common';

import { GraphQLInputObjectType } from 'graphql';
import { pascalCase } from 'twenty-shared/utils';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { ObjectMetadataOrderByBaseGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/order-by-input/object-metadata-order-by-base.generator';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';
import { computeObjectMetadataInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-input-type.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

@Injectable()
export class ObjectMetadataOrderByGqlInputTypeGenerator {
  private readonly logger = new Logger(
    ObjectMetadataOrderByGqlInputTypeGenerator.name,
  );
  constructor(
    private readonly gqlTypesStorage: GqlTypesStorage,
    private readonly objectMetadataOrderByBaseGenerator: ObjectMetadataOrderByBaseGenerator,
  ) {}

  public buildAndStore({
    flatObjectMetadata,
    fields,
    context,
  }: {
    flatObjectMetadata: FlatObjectMetadata;
    fields: FlatFieldMetadata[];
    context: SchemaGenerationContext;
  }) {
    const inputType = new GraphQLInputObjectType({
      name: `${pascalCase(flatObjectMetadata.nameSingular)}${GqlInputTypeDefinitionKind.OrderBy.toString()}Input`,
      description: flatObjectMetadata.description,
      fields: () =>
        this.objectMetadataOrderByBaseGenerator.generateFields({
          fields,
          logger: this.logger,
          context,
        }),
    }) as GraphQLInputObjectType;

    const key = computeObjectMetadataInputTypeKey(
      flatObjectMetadata.nameSingular,
      GqlInputTypeDefinitionKind.OrderBy,
    );

    this.gqlTypesStorage.addGqlType(key, inputType);
  }
}
