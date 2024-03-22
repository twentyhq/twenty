import { computeSchemaComponents } from 'src/engine/core-modules/open-api/utils/components.utils';
import { objectMetadataItemMock } from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

describe('computeSchemaComponents', () => {
  it('should compute schema components', () => {
    expect(
      computeSchemaComponents([
        objectMetadataItemMock,
      ] as ObjectMetadataEntity[]),
    ).toEqual({
      ObjectName: {
        type: 'object',
        required: ['fieldNumber'],
        example: { fieldNumber: '' },
        properties: {
          fieldCurrency: {
            properties: {
              amountMicros: { type: 'string' },
              currencyCode: { type: 'string' },
            },
            type: 'object',
          },
          fieldLink: {
            properties: {
              label: { type: 'string' },
              url: { type: 'string' },
            },
            type: 'object',
          },
          fieldNumber: {
            type: 'number',
          },
          fieldString: {
            type: 'string',
          },
        },
      },
    });
  });
});
