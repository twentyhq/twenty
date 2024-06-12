import {
  fieldCurrencyMock,
  fieldLinkMock,
  fieldNumberMock,
  fieldTextMock,
  objectMetadataItemMock,
} from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { mapFieldMetadataToGraphqlQuery } from 'src/engine/api/rest/rest-api-core-query-builder/utils/map-field-metadata-to-graphql-query.utils';

describe('mapFieldMetadataToGraphqlQuery', () => {
  it('should map properly', () => {
    expect(
      mapFieldMetadataToGraphqlQuery(objectMetadataItemMock, fieldNumberMock),
    ).toEqual('fieldNumber');
    expect(
      mapFieldMetadataToGraphqlQuery(objectMetadataItemMock, fieldTextMock),
    ).toEqual('fieldText');
    expect(
      mapFieldMetadataToGraphqlQuery(objectMetadataItemMock, fieldLinkMock),
    ).toEqual(`
      fieldLink
      {
        label
        url
      }
    `);
    expect(
      mapFieldMetadataToGraphqlQuery(objectMetadataItemMock, fieldCurrencyMock),
    ).toEqual(`
      fieldCurrency
      {
        amountMicros
        currencyCode
      }
    `);
  });
});
