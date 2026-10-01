import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getCompatibleEndDateFields } from '@/views/utils/getCompatibleEndDateFields';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const dateField = (id: string, type: FieldMetadataType) =>
  ({ id, type }) as FieldMetadataItem;

const DATE_FIELDS = [
  dateField('starts-on', FieldMetadataType.DATE),
  dateField('ends-on', FieldMetadataType.DATE),
  dateField('happens-at', FieldMetadataType.DATE_TIME),
];

describe('getCompatibleEndDateFields', () => {
  it('keeps fields of the start field type, excluding the start field', () => {
    expect(
      getCompatibleEndDateFields({
        dateFields: DATE_FIELDS,
        startFieldMetadataId: 'starts-on',
      }).map(({ id }) => id),
    ).toEqual(['ends-on']);
  });

  it('returns nothing when no start field is selected', () => {
    expect(
      getCompatibleEndDateFields({
        dateFields: DATE_FIELDS,
        startFieldMetadataId: '',
      }),
    ).toEqual([]);
  });
});
