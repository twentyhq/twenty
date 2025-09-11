import { Injectable, Logger } from '@nestjs/common';

import { GraphQLObjectType } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { StoredObjectType } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/stored-gql-type.interface';
import { type WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';

import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { CursorScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';
import { GraphQLOutputTypeFieldConfigMap } from 'src/engine/api/graphql/workspace-schema-builder/types/graphql-field-config-map.types';
import { computeObjectMetadataObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-object-type-key.util';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class EdgeObjectTypeGenerator {
  private readonly logger = new Logger(EdgeObjectTypeGenerator.name);

  constructor(
    private readonly typeMapperService: TypeMapperService,
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public generate(
    objectMetadata: ObjectMetadataEntity,
    options: WorkspaceBuildSchemaOptions,
  ): StoredObjectType {
    const kind = ObjectTypeDefinitionKind.Edge;
    const key = computeObjectMetadataObjectTypeKey(
      objectMetadata.nameSingular,
      kind,
    );

    return {
      key,
      type: new GraphQLObjectType({
        name: `${pascalCase(objectMetadata.nameSingular)}${kind.toString()}`,
        description: objectMetadata.description,
        fields: () => this.generateFields(objectMetadata, options),
      }),
    };
  }

  private generateFields(
    objectMetadata: ObjectMetadataEntity,
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLOutputTypeFieldConfigMap {
    const fields: GraphQLOutputTypeFieldConfigMap = {};

    const key = computeObjectMetadataObjectTypeKey(
      objectMetadata.nameSingular,
      ObjectTypeDefinitionKind.Plain,
    );

    const objectType = this.typeDefinitionsStorage.getObjectTypeByKey(key);

    if (!isDefined(objectType)) {
      this.logger.error(
        `Node type for ${objectMetadata.nameSingular} was not found. Please, check if you have defined it.`,
        {
          objectMetadata,
          options,
        },
      );

      throw new Error(
        `Node type for ${objectMetadata.nameSingular} was not found. Please, check if you have defined it.`,
      );
    }

    const typeOptions = {
      nullable: false,
    };

    fields.node = {
      type: this.typeMapperService.mapToGqlType(objectType, typeOptions),
    };

    fields.cursor = {
      type: this.typeMapperService.mapToGqlType(CursorScalarType, typeOptions),
    };

    return fields;
  }
}
