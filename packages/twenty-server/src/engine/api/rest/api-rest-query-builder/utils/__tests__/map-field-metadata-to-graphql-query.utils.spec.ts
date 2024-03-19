import {
  fieldCurrencyMock,
  fieldLinkMock,
  fieldNumberMock,
  fieldStringMock,
  objectMetadataItemMock,
} from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { mapFieldMetadataToGraphqlQuery } from 'src/engine/api/rest/api-rest-query-builder/utils/map-field-metadata-to-graphql-query.utils';

describe('mapFieldMetadataToGraphqlQuery', () => {
  it('should map properly', () => {
    expect(
      mapFieldMetadataToGraphqlQuery(objectMetadataItemMock, fieldNumberMock),
    ).toEqual('fieldNumber');
    expect(
      mapFieldMetadataToGraphqlQuery(objectMetadataItemMock, fieldStringMock),
    ).toEqual('fieldString');
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
