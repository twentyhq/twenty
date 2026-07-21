import { getEffectiveRecordCalendarEndFieldMetadataId } from '@/object-record/record-calendar/utils/getEffectiveRecordCalendarEndFieldMetadataId';

describe('getEffectiveRecordCalendarEndFieldMetadataId', () => {
  it('keeps the configured end field when the week view is enabled', () => {
    expect(
      getEffectiveRecordCalendarEndFieldMetadataId({
        calendarEndFieldMetadataId: 'end-field-id',
        isCalendarWeekViewEnabled: true,
      }),
    ).toBe('end-field-id');
  });

  it.each([null, undefined])(
    'normalizes %s to null when the week view is enabled',
    (calendarEndFieldMetadataId) => {
      expect(
        getEffectiveRecordCalendarEndFieldMetadataId({
          calendarEndFieldMetadataId,
          isCalendarWeekViewEnabled: true,
        }),
      ).toBeNull();
    },
  );

  it('makes a configured end field inert when the week view is disabled', () => {
    expect(
      getEffectiveRecordCalendarEndFieldMetadataId({
        calendarEndFieldMetadataId: 'end-field-id',
        isCalendarWeekViewEnabled: false,
      }),
    ).toBeNull();
  });
});
