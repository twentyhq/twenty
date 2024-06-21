import { objectMetadataItemMock } from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { checkFields } from 'src/engine/api/rest/core/query-builder/utils/check-fields.utils';
import { checkArrayFields } from 'src/engine/api/rest/core/query-builder/utils/check-order-by.utils';

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

  it('should check field types from array of fields', () => {
    expect(() =>
      checkArrayFields(objectMetadataItemMock, [{ fieldNumber: undefined }]),
    ).not.toThrow();

    expect(() =>
      checkArrayFields(objectMetadataItemMock, [{ wrongField: undefined }]),
    ).toThrow();

    expect(() =>
      checkArrayFields(objectMetadataItemMock, [
        { fieldNumber: undefined },
        { wrongField: undefined },
      ]),
    ).toThrow();
  });
});
