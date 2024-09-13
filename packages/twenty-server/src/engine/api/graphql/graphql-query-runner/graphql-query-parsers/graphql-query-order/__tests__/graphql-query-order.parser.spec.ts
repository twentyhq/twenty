import { OrderByDirection } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';

import { GraphqlQueryOrderFieldParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/graphql-query-order.parser';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataMap } from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';

describe('GraphqlQueryOrderFieldParser', () => {
  let parser: GraphqlQueryOrderFieldParser;
  const fieldMetadataMap: FieldMetadataMap = {};

  beforeEach(() => {
    fieldMetadataMap['name'] = {
      id: 'name-id',
      name: 'name',
      type: FieldMetadataType.TEXT,
      label: 'Name',
      objectMetadataId: 'object-id',
    };
    fieldMetadataMap['age'] = {
      id: 'age-id',
      name: 'age',
      type: FieldMetadataType.NUMBER,
      label: 'Age',
      objectMetadataId: 'object-id',
    };
    fieldMetadataMap['address'] = {
      id: 'address-id',
      name: 'address',
      type: FieldMetadataType.ADDRESS,
      label: 'Address',
      objectMetadataId: 'object-id',
    };

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
  });
});
