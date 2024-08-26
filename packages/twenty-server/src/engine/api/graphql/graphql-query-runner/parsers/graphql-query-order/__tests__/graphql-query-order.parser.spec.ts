import { OrderByDirection } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { GraphqlQueryOrderFieldParser } from 'src/engine/api/graphql/graphql-query-runner/parsers/graphql-query-order/graphql-query-order.parser';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

describe('GraphqlQueryOrderFieldParser', () => {
  let parser: GraphqlQueryOrderFieldParser;
  let fieldMetadataMap: Map<string, FieldMetadataInterface>;

  beforeEach(() => {
    fieldMetadataMap = new Map<string, FieldMetadataInterface>();
    fieldMetadataMap.set('name', {
      id: 'name-id',
      name: 'name',
      type: FieldMetadataType.TEXT,
      label: 'Name',
      objectMetadataId: 'object-id',
    });
    fieldMetadataMap.set('age', {
      id: 'age-id',
      name: 'age',
      type: FieldMetadataType.NUMBER,
      label: 'Age',
      objectMetadataId: 'object-id',
    });
    fieldMetadataMap.set('address', {
      id: 'address-id',
      name: 'address',
      type: FieldMetadataType.ADDRESS,
      label: 'Address',
      objectMetadataId: 'object-id',
    });

    parser = new GraphqlQueryOrderFieldParser(fieldMetadataMap);
  });
  describe('parse', () => {
    it('should parse simple order by fields', () => {
      const orderBy = [
        { name: OrderByDirection.AscNullsFirst },
        { age: OrderByDirection.DescNullsLast },
      ];
      const result = parser.parse(orderBy);

      expect(result).toEqual({
        name: { direction: 'ASC', nulls: 'FIRST' },
        age: { direction: 'DESC', nulls: 'LAST' },
      });
    });

    it('should ignore undefined values', () => {
      const orderBy = [
        { name: OrderByDirection.AscNullsFirst, nonExistent: undefined },
      ];
      const result = parser.parse(orderBy);

      expect(result).toEqual({
        name: { direction: 'ASC', nulls: 'FIRST' },
      });
    });
  });
});
