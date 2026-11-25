import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { formatFieldMetadataItemInput } from '@/object-metadata/utils/formatFieldMetadataItemInput';

describe('formatFieldMetadataItemInput', () => {
  it('should format the field metadata item input correctly', () => {
    const options: FieldMetadataItemOption[] = [
      {
        id: '1',
        label: 'Option 1',
        color: 'red' as const,
        position: 0,
        value: 'OPTION_1',
      },
      {
        id: '2',
        label: 'Option 2',
        color: 'blue' as const,
        position: 1,
        value: 'OPTION_2',
      },
    ];
    const input = {
      defaultValue: "'OPTION_1'",
      label: 'Example Label',
      name: 'exampleLabel',
      icon: 'example-icon',
      type: FieldMetadataType.SELECT,
      description: 'Example description',
      options,
      isLabelSyncedWithName: true,
    };

    const expected = {
      description: 'Example description',
      icon: 'example-icon',
      label: 'Example Label',
      name: 'exampleLabel',
      options,
      defaultValue: "'OPTION_1'",
      isLabelSyncedWithName: true,
    };

    const result = formatFieldMetadataItemInput(input);

    expect(result).toEqual(expected);
  });

  it('should store a formula in the field settings', () => {
    expect(
      formatFieldMetadataItemInput({
        settings: { decimals: 2 },
        formula: ' price * quantity ',
      }).settings,
    ).toEqual({ decimals: 2, formula: { expression: 'price * quantity' } });
  });

  it('should store the currency code expression of a currency formula', () => {
    expect(
      formatFieldMetadataItemInput({
        formula: 'amount.amountMicros * 2',
        formulaCurrencyCode: ' amount.currencyCode ',
      }).settings,
    ).toEqual({
      formula: {
        expression: 'amount.amountMicros * 2',
        currencyCodeExpression: 'amount.currencyCode',
      },
    });
  });

  it('should clear the formula of a formula field when it is emptied', () => {
    expect(
      formatFieldMetadataItemInput({
        settings: { decimals: 2, formula: { expression: 'price * 2' } },
        formula: ' ',
      }).settings,
    ).toEqual({ decimals: 2, formula: null });
  });

  it('should clear a formula from the existing settings when the form leaves settings out', () => {
    expect(
      formatFieldMetadataItemInput({
        formula: '',
        existingSettings: { formula: { expression: 'price > 10' } },
      }).settings,
    ).toEqual({ formula: null });
  });

  it('should not add an empty formula to a field that has none', () => {
    expect(
      formatFieldMetadataItemInput({ settings: { decimals: 2 }, formula: '' })
        .settings,
    ).toEqual({ decimals: 2 });
  });

  it('should leave settings as they are when no formula is given', () => {
    expect(
      formatFieldMetadataItemInput({ settings: { decimals: 2 } }).settings,
    ).toEqual({ decimals: 2 });
  });

  it('should handle input without options', () => {
    const input = {
      label: 'Example Label',
      name: 'exampleLabel',
      icon: 'example-icon',
      type: FieldMetadataType.SELECT,
      description: 'Example description',
      isLabelSyncedWithName: true,
    };

    const expected = {
      description: 'Example description',
      icon: 'example-icon',
      label: 'Example Label',
      name: 'exampleLabel',
      options: undefined,
      defaultValue: undefined,
      isLabelSyncedWithName: true,
    };

    const result = formatFieldMetadataItemInput(input);

    expect(result).toEqual(expected);
  });

  it('should format the field metadata item multi select input correctly', () => {
    const options: FieldMetadataItemOption[] = [
      {
        id: '1',
        label: 'Option 1',
        color: 'red' as const,
        position: 0,
        value: 'OPTION_1',
      },
      {
        id: '2',
        label: 'Option 2',
        color: 'blue' as const,
        position: 1,
        value: 'OPTION_2',
      },
    ];
    const input = {
      defaultValue: ["'OPTION_1'", "'OPTION_2'"],
      label: 'Example Label',
      name: 'exampleLabel',
      icon: 'example-icon',
      type: FieldMetadataType.MULTI_SELECT,
      description: 'Example description',
      options,
      isLabelSyncedWithName: true,
    };

    const expected = {
      description: 'Example description',
      icon: 'example-icon',
      label: 'Example Label',
      name: 'exampleLabel',
      options,
      defaultValue: ["'OPTION_1'", "'OPTION_2'"],
      isLabelSyncedWithName: true,
    };

    const result = formatFieldMetadataItemInput(input);

    expect(result).toEqual(expected);
  });

  it('should handle multi select input without options', () => {
    const input = {
      label: 'Example Label',
      name: 'exampleLabel',
      icon: 'example-icon',
      type: FieldMetadataType.MULTI_SELECT,
      description: 'Example description',
      isLabelSyncedWithName: true,
    };

    const expected = {
      description: 'Example description',
      icon: 'example-icon',
      label: 'Example Label',
      name: 'exampleLabel',
      options: undefined,
      defaultValue: undefined,
      isLabelSyncedWithName: true,
    };

    const result = formatFieldMetadataItemInput(input);

    expect(result).toEqual(expected);
  });
});
