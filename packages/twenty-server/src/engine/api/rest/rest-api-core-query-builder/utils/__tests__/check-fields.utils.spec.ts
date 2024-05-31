import { objectMetadataItemMock } from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { checkFields } from 'src/engine/api/rest/rest-api-core-query-builder/utils/check-fields.utils';

describe('checkFields', () => {
  it('should check field types', () => {
    expect(() =>
      checkFields(objectMetadataItemMock, ['fieldNumber']),
    ).not.toThrow();

    expect(() => checkFields(objectMetadataItemMock, ['wrongField'])).toThrow();

    expect(() =>
      checkFields(objectMetadataItemMock, ['fieldNumber', 'wrongField']),
    ).toThrow();
  });
});
