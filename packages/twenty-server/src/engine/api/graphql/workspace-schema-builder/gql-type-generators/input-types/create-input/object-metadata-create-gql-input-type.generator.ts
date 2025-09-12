import { Injectable } from '@nestjs/common';

import { kind } from 'cloudflare/_shims';
import { GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { computeFieldInputTypeOptions } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-field-input-type-options.util';
import { computeObjectMetadataInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-input-type.util';
import { isFieldMetadataRelationOrMorphRelation } from 'src/engine/api/graphql/workspace-schema-builder/utils/is-field-metadata-relation-or-morph-relation.utils';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class ObjectMetadataCreateGqlInputTypeGenerator {
  constructor(private readonly gqlTypesStorage: GqlTypesStorage) {}

  public buildAndStore(objectMetadata: ObjectMetadataEntity) {
    const inputType = new GraphQLInputObjectType({
      name: `${pascalCase(objectMetadata.nameSingular)}${GqlInputTypeDefinitionKind.Create.toString()}Input`,
      description: objectMetadata.description,
      fields: () => this.generateFields(objectMetadata),
    }) as GraphQLInputObjectType;

    const key = computeObjectMetadataInputTypeKey(
      objectMetadata.nameSingular,
      GqlInputTypeDefinitionKind.Create,
    );

    this.gqlTypesStorage.addGqlType(key, inputType);
  }

  private generateFields(
    objectMetadata: ObjectMetadataEntity,
  ): GraphQLInputFieldConfigMap {
    const allGeneratedFields: GraphQLInputFieldConfigMap = {};

    for (const fieldMetadata of objectMetadata.fields) {
      const typeOptions = computeFieldInputTypeOptions(
        fieldMetadata,
        GqlInputTypeDefinitionKind.Create,
      );

      let generatedFields;

      if (isFieldMetadataRelationOrMorphRelation(fieldMetadata)) {
        generatedFields =
          this.relationFieldTypeGenerator.generateRelationFieldInputType({
            fieldMetadata,
            kind,
            buildOptions: options,
            typeOptions,
          });
      } else {
        const type = this.fieldInputTypeGenerator.generate({
          type: fieldMetadata.type,
          kind,
          buildOptions: options,
          typeOptions,
          key: this.computeFieldTypeKey(objectMetadata, fieldMetadata, kind),
        });

        generatedFields = {
          [fieldMetadata.name]: {
            type,
            description: fieldMetadata.description,
          },
        };
      }
      Object.assign(allGeneratedFields, generatedFields);
    }

    return allGeneratedFields;
  }
}
