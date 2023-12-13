import {
  fieldCurrency,
  fieldLink,
  fieldNumber,
  fieldString,
  objectMetadataItem,
} from 'src/utils/utils-test/object-metadata-item';
import { mapFieldMetadataToGraphqlQuery } from 'src/core/api-rest/api-rest-query-builder/utils/map-field-metadata-to-graphql-query.utils';

describe('mapFieldMetadataToGraphqlQuery', () => {
  it('should map properly', () => {
    expect(
      mapFieldMetadataToGraphqlQuery(objectMetadataItem, fieldNumber),
    ).toEqual('fieldNumber');
    expect(
      mapFieldMetadataToGraphqlQuery(objectMetadataItem, fieldString),
    ).toEqual('fieldString');
    expect(mapFieldMetadataToGraphqlQuery(objectMetadataItem, fieldLink))
      .toEqual(`
      fieldLink
      {
        label
        url
      }
    `);
    expect(mapFieldMetadataToGraphqlQuery(objectMetadataItem, fieldCurrency))
      .toEqual(`
      fieldCurrency
      {
        amountMicros
        currencyCode
      }
    `);
  });
});
