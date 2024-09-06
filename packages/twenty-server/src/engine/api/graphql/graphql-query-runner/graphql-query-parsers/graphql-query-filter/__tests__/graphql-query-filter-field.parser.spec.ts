import { FindOperator, Not } from 'typeorm';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { GraphqlQueryFilterFieldParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/graphql-query-filter-field.parser';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

describe('GraphqlQueryFilterFieldParser', () => {
  let parser: GraphqlQueryFilterFieldParser;
  let mockFieldMetadataMap: Record<string, FieldMetadataInterface>;

  beforeEach(() => {
    mockFieldMetadataMap = {
      simpleField: {
        id: '1',
        name: 'simpleField',
        type: FieldMetadataType.TEXT,
        label: 'Simple Field',
        objectMetadataId: 'obj1',
      },
    };
    parser = new GraphqlQueryFilterFieldParser(mockFieldMetadataMap);
  });
  it('should parse simple field correctly', () => {
    const result = parser.parse('simpleField', 'value', false);

    expect(result).toEqual({ simpleField: 'value' });
  });

  it('should negate simple field correctly', () => {
    const result = parser.parse('simpleField', 'value', true);

    expect(result).toEqual({ simpleField: Not('value') });
  });

  it('should parse object value using operator parser', () => {
    const result = parser.parse('simpleField', { like: '%value%' }, false);

    expect(result).toEqual({
      simpleField: new FindOperator('like', '%%value%%'),
    });
  });
});
