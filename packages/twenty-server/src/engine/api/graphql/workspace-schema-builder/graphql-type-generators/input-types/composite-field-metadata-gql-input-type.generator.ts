import { Injectable } from '@nestjs/common';

import { type CompositeType } from 'twenty-shared/types';

import { CompositeFieldMetadataCreateGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/create-input/composite-field-metadata-create-gql-input-type.generator';
import { CompositeFieldMetadataFilterGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/filter-input/composite-field-metadata-filter-gql-input-types.generator';
import { CompositeFieldMetadataGroupByGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/group-by-input/composite-field-metadata-group-by-gql-input-type.generator';
import { CompositeFieldMetadataOrderByGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/order-by-input/composite-field-metadata-order-by-gql-input-type.generator';
import { CompositeFieldMetadataUpdateGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/update-input/composite-field-metadata-update-gql-input-type.generator';

@Injectable()
export class CompositeFieldMetadataGqlInputTypeGenerator {
  constructor(
    private readonly compositeFieldMetadataCreateGqlInputTypeGenerator: CompositeFieldMetadataCreateGqlInputTypeGenerator,
    private readonly compositeFieldMetadataUpdateGqlInputTypeGenerator: CompositeFieldMetadataUpdateGqlInputTypeGenerator,
    private readonly compositeFieldMetadataFilterGqlInputTypeGenerator: CompositeFieldMetadataFilterGqlInputTypeGenerator,
    private readonly compositeFieldMetadataOrderByGqlInputTypeGenerator: CompositeFieldMetadataOrderByGqlInputTypeGenerator,
    private readonly compositeFieldMetadataGroupByGqlInputTypeGenerator: CompositeFieldMetadataGroupByGqlInputTypeGenerator,
  ) {}

  public buildAndStore(compositeType: CompositeType) {
    this.compositeFieldMetadataCreateGqlInputTypeGenerator.buildAndStore(
      compositeType,
    );
    this.compositeFieldMetadataUpdateGqlInputTypeGenerator.buildAndStore(
      compositeType,
    );
    this.compositeFieldMetadataFilterGqlInputTypeGenerator.buildAndStore(
      compositeType,
    );
    this.compositeFieldMetadataOrderByGqlInputTypeGenerator.buildAndStore(
      compositeType,
    );
    this.compositeFieldMetadataGroupByGqlInputTypeGenerator.buildAndStore(
      compositeType,
    );
  }
}
