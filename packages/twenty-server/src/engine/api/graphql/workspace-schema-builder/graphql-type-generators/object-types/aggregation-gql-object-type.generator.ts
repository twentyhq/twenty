import { Injectable } from '@nestjs/common';

import { GraphQLObjectType } from 'graphql';
import { pascalCase } from 'twenty-shared/utils';

import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { AggregationObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/aggregation-type.generator';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { computeObjectMetadataObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-object-type-key.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// Reused by every connection that reaches this object through a many-to-one relation
@Injectable()
export class AggregationGqlObjectTypeGenerator {
  constructor(
    private readonly aggregationObjectTypeGenerator: AggregationObjectTypeGenerator,
    private readonly gqlTypesStorage: GqlTypesStorage,
  ) {}

  public buildAndStore(
    flatObjectMetadata: FlatObjectMetadata,
    flatFields: FlatFieldMetadata[],
  ) {
    const kind = ObjectTypeDefinitionKind.Aggregation;

    const key = computeObjectMetadataObjectTypeKey(
      flatObjectMetadata.nameSingular,
      kind,
    );

    this.gqlTypesStorage.addGqlType(
      key,
      new GraphQLObjectType({
        name: `${pascalCase(flatObjectMetadata.nameSingular)}${kind.toString()}`,
        description: `Aggregations over ${flatObjectMetadata.nameSingular} records reached through a relation`,
        fields: () => this.aggregationObjectTypeGenerator.generate(flatFields),
      }),
    );
  }
}
