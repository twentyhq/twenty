import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { GraphqlSelectedFieldsRelationParser } from 'src/engine/api/graphql/graphql-query-runner/parsers/graphql-selected-fields/graphql-selected-fields-relation.parser';
import { compositeTypeDefintions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { capitalize } from 'src/utils/capitalize';

export class GraphQLSelectedFieldsParser {
  private graphqlSelectedFieldsRelationParser: GraphqlSelectedFieldsRelationParser;

  constructor(objectMetadataMap: Record<string, any>) {
    this.graphqlSelectedFieldsRelationParser =
      new GraphqlSelectedFieldsRelationParser(objectMetadataMap);
  }

  /**
   * Parses the selected GraphQL fields and returns the fields to select and the relations to fetch.
   *
   * @param graphqlSelectedFields - The selected GraphQL fields.
   * @param fieldMetadataMap - A map of field metadata.
   * @returns An object containing the fields to select and the relations to fetch.
   */
  parse(
    graphqlSelectedFields: Partial<Record<string, any>>,
    fieldMetadataMap: Record<string, FieldMetadataInterface>,
  ): { select: Record<string, any>; relations: Record<string, any> } {
    const result: {
      select: Record<string, any>;
      relations: Record<string, any>;
    } = {
      select: {},
      relations: {},
    };

    for (const [fieldKey, fieldValue] of Object.entries(
      graphqlSelectedFields,
    )) {
      if (this.isConnectionField(fieldKey, fieldValue)) {
        const subResult = this.parse(fieldValue, fieldMetadataMap);

        Object.assign(result.select, subResult.select);
        Object.assign(result.relations, subResult.relations);
        continue;
      }

      const fieldMetadata = fieldMetadataMap[fieldKey];

      if (!fieldMetadata) continue;

      if (isRelationFieldMetadataType(fieldMetadata.type)) {
        this.graphqlSelectedFieldsRelationParser.handleRelationField(
          fieldMetadata,
          fieldKey,
          fieldValue,
          result,
        );
      } else if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        const compositeResult = this.handleCompositeField(
          fieldMetadata,
          fieldValue,
        );

        Object.assign(result.select, compositeResult);
      } else {
        result.select[fieldKey] = true;
      }
    }

    return result;
  }

  private isConnectionField(fieldKey: string, fieldValue: any): boolean {
    return (
      ['edges', 'node'].includes(fieldKey) && typeof fieldValue === 'object'
    );
  }

  /**
   * Handles the parsing of composite fields in the GraphQL selected fields.
   * Composite fields are fields that have sub-fields.
   * This method recursively parses the sub-fields and adds them to the select and relations objects.
   *
   * @param fieldMetadata - The metadata for the composite field being parsed.
   * @param fieldValue - The value of the composite field being parsed.
   * @returns An object containing the select and relations for the composite field.
   */
  private handleCompositeField(
    fieldMetadata: FieldMetadataInterface,
    fieldValue: any,
  ): Record<string, any> {
    const compositeType = compositeTypeDefintions.get(
      fieldMetadata.type as CompositeFieldMetadataType,
    );

    if (!compositeType) {
      throw new Error(
        `Composite type definition not found for type: ${fieldMetadata.type}`,
      );
    }

    return Object.keys(fieldValue)
      .filter((subFieldKey) => subFieldKey !== '__typename')
      .reduce(
        (acc, subFieldKey) => {
          const subFieldMetadata = compositeType.properties.find(
            (property) => property.name === subFieldKey,
          );

          if (!subFieldMetadata) {
            throw new Error(
              `Sub field metadata not found for composite type: ${fieldMetadata.type}`,
            );
          }

          const fullFieldName = `${fieldMetadata.name}${capitalize(subFieldKey)}`;

          acc[fullFieldName] = true;

          return acc;
        },
        {} as Record<string, any>,
      );
  }
}
