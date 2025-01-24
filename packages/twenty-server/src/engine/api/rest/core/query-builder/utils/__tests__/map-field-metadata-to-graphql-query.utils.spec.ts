import { FieldMetadataType } from 'twenty-shared';

import {
  fieldCurrencyMock,
  fieldNumberMock,
  fieldTextMock,
  objectMetadataItemMock,
} from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { mapFieldMetadataToGraphqlQuery } from 'src/engine/api/rest/core/query-builder/utils/map-field-metadata-to-graphql-query.utils';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

describe('mapFieldMetadataToGraphqlQuery', () => {
  it('should map properly', () => {
    expect(
      mapFieldMetadataToGraphqlQuery([objectMetadataItemMock], fieldNumberMock),
    ).toEqual('fieldNumber');
    expect(
      mapFieldMetadataToGraphqlQuery([objectMetadataItemMock], fieldTextMock),
    ).toEqual('fieldText');
    expect(
      mapFieldMetadataToGraphqlQuery(
        [objectMetadataItemMock],
        fieldCurrencyMock,
      ),
    ).toEqual(`
      fieldCurrency
      {
        amountMicros
        currencyCode
      }
    `);
  });
  describe('should handle all field metadata types', () => {
    Object.values(FieldMetadataType).forEach((fieldMetadataType) => {
      it(`with field type ${fieldMetadataType}`, () => {
        const field = {
          type: fieldMetadataType,
          name: 'toObjectMetadataName',
          fromRelationMetadata: {
            relationType: RelationMetadataType.ONE_TO_MANY,
          },
        };

        expect(
          mapFieldMetadataToGraphqlQuery([objectMetadataItemMock], field),
        ).toBeDefined();
      });
    });
  });
});
