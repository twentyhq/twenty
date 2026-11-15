import { getAggregatedFieldMetadataItems } from '@/object-record/record-column-aggregate/utils/getAggregatedFieldMetadataItems';
import { FieldMetadataType } from 'twenty-shared/types';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('getAggregatedFieldMetadataItems', () => {
  it('lists the number, currency, rating and date fields of the related object', () => {
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
          FieldMetadataType.RATING,
          FieldMetadataType.DATE,
          FieldMetadataType.DATE_TIME,
        ].includes(type),
      ),
    ).toBe(true);
  });

  it('lists rating fields, which the server averages', () => {
    const opportunity = getMockObjectMetadataItemOrThrow('opportunity');
    const ratingFieldMetadataItem = {
      ...opportunity.readableFields[0],
      name: 'score',
      type: FieldMetadataType.RATING,
      isSystem: false,
      isActive: true,
    };

    expect(
      getAggregatedFieldMetadataItems({
        readableFields: [ratingFieldMetadataItem],
      }).map(({ name }) => name),
    ).toEqual(['score']);
  });
});
