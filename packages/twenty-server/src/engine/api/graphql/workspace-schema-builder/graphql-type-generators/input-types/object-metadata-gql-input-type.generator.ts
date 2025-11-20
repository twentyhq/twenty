import { Injectable } from '@nestjs/common';

import { ObjectMetadataCreateGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/create-input/object-metadata-create-gql-input-type.generator';
import { ObjectMetadataFilterGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/filter-input/object-metadata-filter-gql-input-type.generator';
import { ObjectMetadataGroupByGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/group-by-input/object-metadata-group-by-gql-input-type.generator';
import { ObjectMetadataOrderByGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/order-by-input/object-metadata-order-by-gql-input-type.generator';
import { ObjectMetadataOrderByWithGroupByGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/order-by-input/object-metadata-order-by-with-group-by-gql-input-type.generator';
import { ObjectMetadataUpdateGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/update-input/object-metadata-update-gql-input-type.generator';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

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
    objectMetadata: ObjectMetadataEntity,
    objectMetadataCollection?: ObjectMetadataEntity[],
  ) {
    this.objectMetadataCreateGqlInputTypeGenerator.buildAndStore(
      objectMetadata,
    );
    this.objectMetadataUpdateGqlInputTypeGenerator.buildAndStore(
      objectMetadata,
    );
    this.objectMetadataFilterGqlInputTypeGenerator.buildAndStore(
      objectMetadata,
    );
    this.objectMetadataOrderByGqlInputTypeGenerator.buildAndStore({
      objectMetadata,
    });
    this.objectMetadataOrderByWithGroupByGqlInputTypeGenerator.buildAndStore({
      objectMetadata,
      objectMetadataCollection,
    });
    this.objectMetadataGroupByGqlInputTypeGenerator.buildAndStore(
      objectMetadata,
      objectMetadataCollection,
    );
  }
}
