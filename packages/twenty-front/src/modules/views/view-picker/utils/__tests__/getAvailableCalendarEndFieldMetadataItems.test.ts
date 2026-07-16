import { getAvailableCalendarEndFieldMetadataItems } from '@/views/view-picker/utils/getAvailableCalendarEndFieldMetadataItems';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const availableFieldsForCalendar = [
  { id: 'date-start', type: FieldMetadataType.DATE },
  { id: 'date-end', type: FieldMetadataType.DATE },
  { id: 'date-time-start', type: FieldMetadataType.DATE_TIME },
  { id: 'date-time-end', type: FieldMetadataType.DATE_TIME },
];

describe('getAvailableCalendarEndFieldMetadataItems', () => {
  it('returns fields matching the start field type and excludes the start field', () => {
    expect(
      getAvailableCalendarEndFieldMetadataItems({
        availableFieldsForCalendar,
        calendarFieldMetadataId: 'date-time-start',
      }),
    ).toEqual([{ id: 'date-time-end', type: FieldMetadataType.DATE_TIME }]);
  });

  it('returns no fields when the start field cannot be found', () => {
    expect(
      getAvailableCalendarEndFieldMetadataItems({
        availableFieldsForCalendar,
        calendarFieldMetadataId: 'missing',
      }),
    ).toEqual([]);
  });
});
