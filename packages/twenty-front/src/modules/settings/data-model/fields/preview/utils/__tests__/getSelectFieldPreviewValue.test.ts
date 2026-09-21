import { FieldMetadataType } from '~/generated-metadata/graphql';

import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getSelectFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getSelectFieldPreviewValue';

const mockedCompanyObjectMetadataItem =
  getTestEnrichedObjectMetadataItemsMock().find(
    (item) => item.nameSingular === 'company',
  );

const mockedOpportunityObjectMetadataItem =
  getTestEnrichedObjectMetadataItemsMock().find(
    (item) => item.nameSingular === 'opportunity',
  );

describe('getSelectFieldPreviewValue', () => {
  it('returns null if the field is not a Select field', () => {
    const fieldMetadataItem = mockedCompanyObjectMetadataItem?.fields.find(
      ({ type }) => type !== FieldMetadataType.SELECT,
    );

    if (!fieldMetadataItem) {
      throw new Error('Field not found');
    }

    const previewValue = getSelectFieldPreviewValue({ fieldMetadataItem });

    expect(previewValue).toBeNull();
  });

  const fieldName = 'stage';
  const fieldMetadataItem = mockedOpportunityObjectMetadataItem?.fields.find(
    ({ name }) => name === fieldName,
  );

  if (!fieldMetadataItem) {
    throw new Error(`Field '${fieldName}' not found`);
  }

  it("returns the defaultValue as an option value if a valid defaultValue is found in the field's metadata", () => {
    const defaultValue = "'NEW'";
    const fieldMetadataItemWithDefaultValue = {
      ...fieldMetadataItem,
      defaultValue,
    };

    const previewValue = getSelectFieldPreviewValue({
      fieldMetadataItem: fieldMetadataItemWithDefaultValue,
    });

    expect(previewValue).toBe('NEW');
  });

  it("returns the first option value if no defaultValue was found in the field's metadata", () => {
    const defaultValue = null;
    const fieldMetadataItemWithDefaultValue = {
      ...fieldMetadataItem,
      defaultValue,
    };

    const previewValue = getSelectFieldPreviewValue({
      fieldMetadataItem: fieldMetadataItemWithDefaultValue,
    });

    expect(previewValue).toBe('NEW');
    expect(previewValue).toBe(
      fieldMetadataItemWithDefaultValue.options?.[0]?.value,
    );
  });

  it("returns the first option value if the defaultValue found in the field's metadata is invalid", () => {
    const defaultValue = false;
    const fieldMetadataItemWithDefaultValue = {
      ...fieldMetadataItem,
      defaultValue,
    };

    const previewValue = getSelectFieldPreviewValue({
      fieldMetadataItem: fieldMetadataItemWithDefaultValue,
    });

    expect(previewValue).toBe('NEW');
    expect(previewValue).toBe(
      fieldMetadataItemWithDefaultValue.options?.[0]?.value,
    );
  });

  it('returns null if options are not defined', () => {
    const fieldMetadataItemWithNoOptions = {
      ...fieldMetadataItem,
      options: undefined,
    };

    const previewValue = getSelectFieldPreviewValue({
      fieldMetadataItem: fieldMetadataItemWithNoOptions,
    });

    expect(previewValue).toBeNull();
  });

  it('returns null if options array is empty', () => {
    const fieldMetadataItemWithEmptyOptions = {
      ...fieldMetadataItem,
      options: [],
    };

    const previewValue = getSelectFieldPreviewValue({
      fieldMetadataItem: fieldMetadataItemWithEmptyOptions,
    });

    expect(previewValue).toBeNull();
  });
});
