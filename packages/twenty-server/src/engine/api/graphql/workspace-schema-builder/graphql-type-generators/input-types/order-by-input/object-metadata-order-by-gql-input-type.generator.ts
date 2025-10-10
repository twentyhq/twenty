import { Injectable, Logger } from '@nestjs/common';

import { GraphQLInputObjectType } from 'graphql';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { ObjectMetadataOrderByBaseGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/order-by-input/object-metadata-order-by-base.generator';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { computeObjectMetadataInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-input-type.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

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
    objectMetadata,
  }: {
    objectMetadata: ObjectMetadataEntity;
  }) {
    const inputType = new GraphQLInputObjectType({
      name: `${pascalCase(objectMetadata.nameSingular)}${GqlInputTypeDefinitionKind.OrderBy.toString()}Input`,
      description: objectMetadata.description,
      fields: () =>
        this.objectMetadataOrderByBaseGenerator.generateFields({
          objectMetadata,
          logger: this.logger,
        }),
    }) as GraphQLInputObjectType;

    const key = computeObjectMetadataInputTypeKey(
      objectMetadata.nameSingular,
      GqlInputTypeDefinitionKind.OrderBy,
    );

    this.gqlTypesStorage.addGqlType(key, inputType);
  }
}
