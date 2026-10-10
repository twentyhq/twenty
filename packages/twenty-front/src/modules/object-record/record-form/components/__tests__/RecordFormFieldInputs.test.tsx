import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordFormFieldInputs } from '@/object-record/record-form/components/RecordFormFieldInputs';
import { render } from '@testing-library/react';
import { CurrencyCode } from 'twenty-shared/constants';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const mockFormFieldInput = jest.fn((_: unknown) => null);

jest.mock('@/object-record/record-field/ui/components/FormFieldInput', () => ({
  FormFieldInput: (props: unknown) => mockFormFieldInput(props),
}));

const currencyFieldMetadataItem = {
  id: 'amount-field-id',
  name: 'amount',
  label: 'Amount',
  type: FieldMetadataType.CURRENCY,
  defaultValue: { amountMicros: null, currencyCode: "'USD'" },
} as unknown as FieldMetadataItem;

const objectMetadataItem = {
  id: 'opportunity-object-id',
  nameSingular: 'opportunity',
} as unknown as EnrichedObjectMetadataItem;

const renderInputs = (
  draftRecord: Record<string, unknown>,
  onFieldValueChange = jest.fn(),
) => {
  render(
    <RecordFormFieldInputs
      objectMetadataItem={objectMetadataItem}
      fieldMetadataItems={[currencyFieldMetadataItem]}
      draftRecord={draftRecord}
      onFieldValueChange={onFieldValueChange}
      onFieldValueClear={jest.fn()}
    />,
  );

  return onFieldValueChange;
};

const getPassedDefaultValue = () =>
  (mockFormFieldInput.mock.calls.at(-1)?.[0] as { defaultValue: unknown })
    .defaultValue;

describe('RecordFormFieldInputs', () => {
  beforeEach(() => {
    mockFormFieldInput.mockClear();
  });

  it('pre-fills the currency field default when the draft has no value yet', () => {
    renderInputs({});

    expect(getPassedDefaultValue()).toEqual({
      amountMicros: null,
      currencyCode: CurrencyCode.USD,
    });
  });

  it('keeps the draft value once the user has entered one', () => {
    renderInputs({
      amount: { amountMicros: 1500000000, currencyCode: CurrencyCode.EUR },
    });

    expect(getPassedDefaultValue()).toEqual({
      amountMicros: 1500000000,
      currencyCode: CurrencyCode.EUR,
    });
  });

  it('does not resurrect the default after the field was cleared', () => {
    renderInputs({ amount: null });

    expect(getPassedDefaultValue()).toBeNull();
  });

  it('seeds the draft with the currency default on mount when the draft has no value yet', () => {
    const onFieldValueChange = renderInputs({});

    expect(onFieldValueChange).toHaveBeenCalledWith('amount', {
      amountMicros: null,
      currencyCode: CurrencyCode.USD,
    });
  });

  it('does not seed the draft when it already has a value', () => {
    const onFieldValueChange = renderInputs({
      amount: { amountMicros: 1500000000, currencyCode: CurrencyCode.EUR },
    });

    expect(onFieldValueChange).not.toHaveBeenCalled();
  });

  it('does not seed the draft again after the field was cleared', () => {
    const onFieldValueChange = renderInputs({ amount: null });

    expect(onFieldValueChange).not.toHaveBeenCalled();
  });
});
