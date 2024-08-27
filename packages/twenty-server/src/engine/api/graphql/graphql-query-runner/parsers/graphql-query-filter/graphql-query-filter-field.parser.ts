import { FindOptionsWhere, Not, ObjectLiteral } from 'typeorm';

import { RecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataMap } from 'src/engine/api/graphql/graphql-query-runner/utils/convert-object-metadata-to-map.util';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';
import { capitalize } from 'src/utils/capitalize';
import { isPlainObject } from 'src/utils/is-plain-object';

import { GraphqlQueryFilterConditionParser } from './graphql-query-filter-condition.parser';
import { GraphqlQueryFilterOperatorParser } from './graphql-query-filter-operator.parser';

export class GraphqlQueryFilterFieldParser {
  private fieldMetadataMap: FieldMetadataMap;
  private operatorParser: GraphqlQueryFilterOperatorParser;

  constructor(fieldMetadataMap: FieldMetadataMap) {
    this.fieldMetadataMap = fieldMetadataMap;
    this.operatorParser = new GraphqlQueryFilterOperatorParser();
  }

  public parse(
    key: string,
    value: any,
    isNegated: boolean,
  ): FindOptionsWhere<ObjectLiteral> {
    const fieldMetadata = this.fieldMetadataMap[key];

    if (!fieldMetadata) {
      return {
        [key]: (value: RecordFilter, isNegated: boolean) => {
          const conditionParser = new GraphqlQueryFilterConditionParser(
            this.fieldMetadataMap,
          );

          return conditionParser.parse(value, isNegated);
        },
      };
    }

    if (isCompositeFieldMetadataType(fieldMetadata.type)) {
      return this.parseCompositeFieldForFilter(fieldMetadata, value, isNegated);
    }

    if (isPlainObject(value)) {
      const parsedValue = this.operatorParser.parseOperator(value, isNegated);

      return { [key]: parsedValue };
    }

    return { [key]: isNegated ? Not(value) : value };
  }

  private parseCompositeFieldForFilter(
    fieldMetadata: FieldMetadataInterface,
    fieldValue: any,
    isNegated: boolean,
  ): FindOptionsWhere<ObjectLiteral> {
    const compositeType = compositeTypeDefinitions.get(
      fieldMetadata.type as CompositeFieldMetadataType,
    );

    if (!compositeType) {
      throw new Error(
        `Composite type definition not found for type: ${fieldMetadata.type}`,
      );
    }

    return Object.entries(fieldValue).reduce(
      (result, [subFieldKey, subFieldValue]) => {
        const subFieldMetadata = compositeType.properties.find(
          (property) => property.name === subFieldKey,
        );

        if (!subFieldMetadata) {
          throw new Error(
            `Sub field metadata not found for composite type: ${fieldMetadata.type}`,
          );
        }

        const fullFieldName = `${fieldMetadata.name}${capitalize(subFieldKey)}`;

        if (isPlainObject(subFieldValue)) {
          result[fullFieldName] = this.operatorParser.parseOperator(
            subFieldValue,
            isNegated,
          );
        } else {
          result[fullFieldName] = isNegated
            ? Not(subFieldValue)
            : subFieldValue;
        }

        return result;
      },
      {} as FindOptionsWhere<ObjectLiteral>,
    );
  }
}
