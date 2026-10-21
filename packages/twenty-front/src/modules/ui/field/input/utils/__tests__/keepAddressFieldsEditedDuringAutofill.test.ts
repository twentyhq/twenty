import { type FieldAddressDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import { keepAddressFieldsEditedDuringAutofill } from '@/ui/field/input/utils/keepAddressFieldsEditedDuringAutofill';

const ADDRESS_AT_SELECTION: FieldAddressDraftValue = {
  addressStreet1: '10 Rue',
  addressStreet2: null,
  addressCity: null,
  addressState: null,
  addressPostcode: null,
  addressCountry: null,
  addressLat: null,
  addressLng: null,
};

const AUTOFILLED_ADDRESS: FieldAddressDraftValue = {
  addressStreet1: '10 Rue de Rivoli',
  addressStreet2: null,
  addressCity: 'Paris',
  addressState: 'Île-de-France',
  addressPostcode: '75001',
  addressCountry: 'France',
  addressLat: 48.8566,
  addressLng: 2.3522,
};

describe('keepAddressFieldsEditedDuringAutofill', () => {
  it('keeps the autofilled address when nothing changed while loading', () => {
    expect(
      keepAddressFieldsEditedDuringAutofill({
        autofilledAddress: AUTOFILLED_ADDRESS,
        addressAtSelection: ADDRESS_AT_SELECTION,
        currentAddress: ADDRESS_AT_SELECTION,
      }),
    ).toEqual(AUTOFILLED_ADDRESS);
  });

  it('keeps fields edited while the place details were loading', () => {
    expect(
      keepAddressFieldsEditedDuringAutofill({
        autofilledAddress: AUTOFILLED_ADDRESS,
        addressAtSelection: ADDRESS_AT_SELECTION,
        currentAddress: {
          ...ADDRESS_AT_SELECTION,
          addressCity: 'Lyon',
          addressPostcode: '69001',
        },
      }),
    ).toEqual({
      ...AUTOFILLED_ADDRESS,
      addressCity: 'Lyon',
      addressPostcode: '69001',
    });
  });

  it('keeps a field cleared while the place details were loading', () => {
    expect(
      keepAddressFieldsEditedDuringAutofill({
        autofilledAddress: AUTOFILLED_ADDRESS,
        addressAtSelection: {
          ...ADDRESS_AT_SELECTION,
          addressPostcode: '69001',
        },
        currentAddress: { ...ADDRESS_AT_SELECTION, addressPostcode: null },
      }),
    ).toEqual({ ...AUTOFILLED_ADDRESS, addressPostcode: null });
  });

  it('keeps a field replaced while the place details were loading', () => {
    expect(
      keepAddressFieldsEditedDuringAutofill({
        autofilledAddress: AUTOFILLED_ADDRESS,
        addressAtSelection: { ...ADDRESS_AT_SELECTION, addressCity: 'Lyon' },
        currentAddress: { ...ADDRESS_AT_SELECTION, addressCity: 'Marseille' },
      }),
    ).toEqual({ ...AUTOFILLED_ADDRESS, addressCity: 'Marseille' });
  });

  it('keeps the autofilled address when no current value is known', () => {
    expect(
      keepAddressFieldsEditedDuringAutofill({
        autofilledAddress: AUTOFILLED_ADDRESS,
        addressAtSelection: undefined,
        currentAddress: undefined,
      }),
    ).toEqual(AUTOFILLED_ADDRESS);
  });
});
