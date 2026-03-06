import { Injectable } from '@nestjs/common';

import { type ObjectMetadataCreateGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/create-input/object-metadata-create-gql-input-type.generator';
import { type ObjectMetadataFilterGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/filter-input/object-metadata-filter-gql-input-type.generator';
import { type ObjectMetadataGroupByGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/group-by-input/object-metadata-group-by-gql-input-type.generator';
import { type ObjectMetadataOrderByGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/order-by-input/object-metadata-order-by-gql-input-type.generator';
import { type ObjectMetadataOrderByWithGroupByGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/order-by-input/object-metadata-order-by-with-group-by-gql-input-type.generator';
import { type ObjectMetadataUpdateGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/update-input/object-metadata-update-gql-input-type.generator';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

@Injectable()
export class ObjectMetadataGqlInputTypeGenerator {
  constructor(
    private readonly objectMetadataCreateGqlInputTypeGenerator: ObjectMetadataCreateGqlInputTypeGenerator,
    private readonly objectMetadataUpdateGqlInputTypeGenerator: ObjectMetadataUpdateGqlInputTypeGenerator,
    private readonly objectMetadataFilterGqlInputTypeGenerator: ObjectMetadataFilterGqlInputTypeGenerator,
    private readonly objectMetadataOrderByGqlInputTypeGenerator: ObjectMetadataOrderByGqlInputTypeGenerator,
    private readonly objectMetadataOrderByWithGroupByGqlInputTypeGenerator: ObjectMetadataOrderByWithGroupByGqlInputTypeGenerator,
    private readonly objectMetadataGroupByGqlInputTypeGenerator: ObjectMetadataGroupByGqlInputTypeGenerator,
  ) {}

  public buildAndStore(
    flatObjectMetadata: FlatObjectMetadata,
    fields: FlatFieldMetadata[],
    context: SchemaGenerationContext,
  ) {
    this.objectMetadataCreateGqlInputTypeGenerator.buildAndStore(
      flatObjectMetadata,
      fields,
      context,
    );
    this.objectMetadataUpdateGqlInputTypeGenerator.buildAndStore(
      flatObjectMetadata,
      fields,
      context,
    );
    this.objectMetadataFilterGqlInputTypeGenerator.buildAndStore(
      flatObjectMetadata,
      fields,
    );
    this.objectMetadataOrderByGqlInputTypeGenerator.buildAndStore({
      flatObjectMetadata,
      fields,
      context,
    });
    this.objectMetadataOrderByWithGroupByGqlInputTypeGenerator.buildAndStore({
      flatObjectMetadata,
      fields,
      context,
    });
    this.objectMetadataGroupByGqlInputTypeGenerator.buildAndStore(
      flatObjectMetadata,
      fields,
      context,
    );
  }
}
