import { objectMetadataItem } from 'src/utils/utils-test/object-metadata-item';
import {
  computeNodeExample,
  computeNodeProperties,
} from 'src/core/open-api/utils/compute-path.utils';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';

const item: DeepPartial<ObjectMetadataEntity> = objectMetadataItem;

describe('computePathUtils', () => {
  describe('computeNodeProperties', () => {
    it('should compute node properties', () => {
      expect(computeNodeProperties(item as ObjectMetadataEntity)).toEqual({
        fieldCurrency: {
          items: {},
          type: 'string',
        },
        fieldLink: {
          items: {},
          type: 'string',
        },
        fieldNumber: {
          items: {},
          type: 'number',
        },
        fieldString: {
          items: {},
          type: 'string',
        },
      });
    });
  });
  describe('computeNodeExample', () => {
    it('should compute node example', () => {
      expect(computeNodeExample(item as ObjectMetadataEntity)).toEqual({
        fieldCurrency: {
          amountMicros: 'fieldCurrencyAmountMicros',
          currencyCode: 'fieldCurrencyCurrencyCode',
        },
        fieldLink: {
          label: 'fieldLinkLabel',
          url: 'fieldLinkUrl',
        },
        fieldNumber: 'fieldNumber',
        fieldString: 'fieldString',
      });
    });
  });
});
