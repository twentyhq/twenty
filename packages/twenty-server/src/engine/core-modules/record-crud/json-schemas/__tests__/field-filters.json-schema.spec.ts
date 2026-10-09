import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { generateFieldFilterJsonSchema } from 'src/engine/core-modules/record-crud/json-schemas/field-filters.json-schema';
import { type JsonSchemaDefinitions } from 'src/engine/core-modules/record-crud/types/json-schema-definitions.type';
import { getToolSchemaFieldMock } from 'src/engine/core-modules/record-crud/__mocks__/get-tool-schema-field-mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const generateResolvedFilter = (field: FlatFieldMetadata) => {
  const definitions: JsonSchemaDefinitions = {};
  const filter = generateFieldFilterJsonSchema({ field, definitions });
  const definitionName = filter?.$ref?.replace('#/$defs/', '');

  return isDefined(definitionName) ? definitions[definitionName] : filter;
};

describe('generateFieldFilterJsonSchema', () => {
  it('should expose pattern operators at the root of text filters', () => {
    expect(
      Object.keys(
        generateResolvedFilter(
          getToolSchemaFieldMock({
            name: 'title',
            type: FieldMetadataType.TEXT,
          }),
        )?.properties ?? {},
      ),
    ).toEqual(expect.arrayContaining(['eq', 'ilike', 'startsWith', 'is']));
  });

  it('should filter rich text through its markdown sub-field', () => {
    expect(
      Object.keys(
        generateResolvedFilter(
          getToolSchemaFieldMock({
            name: 'body',
            type: FieldMetadataType.RICH_TEXT,
          }),
        )?.properties ?? {},
      ),
    ).toEqual(['markdown']);
  });

  it('should filter many-to-one morph relations by the related record id', () => {
    expect(
      Object.keys(
        generateResolvedFilter(
          getToolSchemaFieldMock({
            name: 'targetPerson',
            type: FieldMetadataType.MORPH_RELATION,
            settings: { relationType: RelationType.MANY_TO_ONE },
          }),
        )?.properties ?? {},
      ),
    ).toEqual(['eq', 'neq', 'in', 'is']);
  });

  it('should not filter one-to-many relations', () => {
    expect(
      generateFieldFilterJsonSchema({
        field: getToolSchemaFieldMock({
          name: 'people',
          type: FieldMetadataType.RELATION,
          settings: { relationType: RelationType.ONE_TO_MANY },
        }),
        definitions: {},
      }),
    ).toBeNull();
  });

  it('should restrict select filters to the field options', () => {
    expect(
      generateResolvedFilter(
        getToolSchemaFieldMock({
          name: 'stage',
          type: FieldMetadataType.SELECT,
          options: [
            {
              id: 'new',
              value: 'NEW',
              label: 'New',
              color: 'blue',
              position: 0,
            },
            {
              id: 'won',
              value: 'WON',
              label: 'Won',
              color: 'green',
              position: 1,
            },
          ],
        }),
      )?.properties?.eq,
    ).toEqual({ description: 'Equals', type: 'string', enum: ['NEW', 'WON'] });
  });

  it('should not filter select fields without options', () => {
    expect(
      generateFieldFilterJsonSchema({
        field: getToolSchemaFieldMock({
          name: 'stage',
          type: FieldMetadataType.SELECT,
          options: [],
        }),
        definitions: {},
      }),
    ).toBeNull();
  });
});
