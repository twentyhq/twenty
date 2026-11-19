import { getConditionalAvailabilityRecordFieldSelectOptions } from '@/conditional-availability/utils/getConditionalAvailabilityRecordFieldSelectOptions';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('getConditionalAvailabilityRecordFieldSelectOptions', () => {
  it('lists the options of a select field in their order', () => {
    expect(
      getConditionalAvailabilityRecordFieldSelectOptions({
        field: {
          type: FieldMetadataType.SELECT,
          options: [
            {
              id: 'won',
              value: 'WON',
              label: 'Won',
              color: 'green',
              position: 1,
            },
            {
              id: 'new',
              value: 'NEW',
              label: 'New',
              color: 'blue',
              position: 0,
            },
          ],
        },
      }),
    ).toEqual([
      { value: 'NEW', label: 'New' },
      { value: 'WON', label: 'Won' },
    ]);
  });

  it('lists currencies for a currency field', () => {
    expect(
      getConditionalAvailabilityRecordFieldSelectOptions({
        field: { type: FieldMetadataType.CURRENCY, options: null },
      }),
    ).toContainEqual({ value: 'EUR', label: 'Euro' });
  });

  it('lists actor sources for an actor field', () => {
    expect(
      getConditionalAvailabilityRecordFieldSelectOptions({
        field: { type: FieldMetadataType.ACTOR, options: null },
      }),
    ).toContainEqual({ value: 'MANUAL', label: 'User' });
  });

  it('lists nothing for a text field', () => {
    expect(
      getConditionalAvailabilityRecordFieldSelectOptions({
        field: { type: FieldMetadataType.TEXT, options: null },
      }),
    ).toEqual([]);
  });
});
