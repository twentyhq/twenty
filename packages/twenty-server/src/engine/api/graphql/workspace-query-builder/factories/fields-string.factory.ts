import { Injectable, Logger } from '@nestjs/common';

import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import isEmpty from 'lodash.isempty';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';
import { Record } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';

import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';

import { FieldAliasFactory } from './field-alias.factory';
import { RelationFieldAliasFactory } from './relation-field-alias.factory';

@Injectable()
export class FieldsStringFactory {
  private readonly logger = new Logger(FieldsStringFactory.name);

  constructor(
    private readonly fieldAliasFactory: FieldAliasFactory,
    private readonly relationFieldAliasFactory: RelationFieldAliasFactory,
  ) {}

  async create(
    info: GraphQLResolveInfo,
    fieldMetadataCollection: FieldMetadataInterface[],
    objectMetadataCollection: ObjectMetadataInterface[],
    withSoftDeleted?: boolean,
  ): Promise<string> {
    const selectedFields: Partial<Record> = graphqlFields(info);

    console.log('selectedFields', JSON.stringify(selectedFields, null, 2));

    const res = await this.createFieldsStringRecursive(
      info,
      selectedFields,
      fieldMetadataCollection,
      objectMetadataCollection,
      withSoftDeleted ?? false,
    );

    console.log('res', res);

    return res;
  }

  async createFieldsStringRecursive(
    info: GraphQLResolveInfo,
    selectedFields: Partial<Record>,
    fieldMetadataCollection: FieldMetadataInterface[],
    objectMetadataCollection: ObjectMetadataInterface[],
    withSoftDeleted: boolean,
    accumulator = '',
  ): Promise<string> {
    const fieldMetadataMap = new Map(
      fieldMetadataCollection.map((metadata) => [metadata.name, metadata]),
    );

    for (const [fieldKey, fieldValue] of Object.entries(selectedFields)) {
      let fieldAlias: string | null;

      if (fieldMetadataMap.has(fieldKey)) {
        // We're sure that the field exists in the map after this if condition
        // ES6 should tackle that more properly
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const fieldMetadata = fieldMetadataMap.get(fieldKey)!;

        // If the field is a relation field, we need to create a special alias
        if (isRelationFieldMetadataType(fieldMetadata.type)) {
          const alias = await this.relationFieldAliasFactory.create(
            fieldKey,
            fieldValue,
            fieldMetadata,
            objectMetadataCollection,
            info,
            withSoftDeleted,
          );

          fieldAlias = alias;
        } else {
          // Otherwise we just need to create a simple alias
          const alias = this.fieldAliasFactory.create(fieldKey, fieldMetadata);

          fieldAlias = alias;
        }
      }

      fieldAlias ??= fieldKey;

      // Recurse if value is a nested object, otherwise append field or alias
      if (
        !fieldMetadataMap.has(fieldKey) &&
        fieldValue &&
        typeof fieldValue === 'object' &&
        !isEmpty(fieldValue)
      ) {
        accumulator += `${fieldKey} {\n`;
        accumulator = await this.createFieldsStringRecursive(
          info,
          fieldValue,
          fieldMetadataCollection,
          objectMetadataCollection,
          withSoftDeleted,
          accumulator,
        );
        accumulator += `}\n`;
      } else {
        accumulator += `${fieldAlias}\n`;
      }
    }

    return accumulator;
  }
}
