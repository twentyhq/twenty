import { getAggregatedFieldMetadataItems } from '@/object-record/record-column-aggregate/utils/getAggregatedFieldMetadataItems';
import { FieldMetadataType } from 'twenty-shared/types';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('getAggregatedFieldMetadataItems', () => {
  it('lists the number, currency and date fields of the related object', () => {
    const aggregatedFieldMetadataItems = getAggregatedFieldMetadataItems(
      getMockObjectMetadataItemOrThrow('opportunity'),
    );
    const fieldNames = aggregatedFieldMetadataItems.map(({ name }) => name);

    expect(fieldNames).toContain('amount');
    expect(fieldNames).toContain('closeDate');
    expect(fieldNames).not.toContain('name');
    expect(
      aggregatedFieldMetadataItems.every(({ type }) =>
        [
          FieldMetadataType.NUMBER,
          FieldMetadataType.CURRENCY,
          FieldMetadataType.DATE,
          FieldMetadataType.DATE_TIME,
        ].includes(type),
      ),
    ).toBe(true);
  });
});
