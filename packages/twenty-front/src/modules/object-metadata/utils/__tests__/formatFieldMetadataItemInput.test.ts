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

  it('should send a formula next to the settings', () => {
    expect(
      formatFieldMetadataItemInput({
        settings: { decimals: 2 },
        formula: ' price * quantity ',
      }),
    ).toMatchObject({
      settings: { decimals: 2 },
      formula: { expression: 'price * quantity' },
    });
  });

  it('should send the currency code expression of a currency formula', () => {
    expect(
      formatFieldMetadataItemInput({
        formula: 'amount.amountMicros * 2',
        formulaCurrencyCode: ' amount.currencyCode ',
      }).formula,
    ).toEqual({
      expression: 'amount.amountMicros * 2',
      currencyCodeExpression: 'amount.currencyCode',
    });
  });

  it('should send the chosen evaluation with the formula', () => {
    expect(
      formatFieldMetadataItemInput({
        formula: 'price * 2',
        formulaEvaluation: 'STORED',
      }).formula,
    ).toEqual({ expression: 'price * 2', evaluation: 'STORED' });
  });

  it('should remove the formula when it is emptied', () => {
    expect(formatFieldMetadataItemInput({ formula: ' ' }).formula).toBeNull();
  });

  it('should leave the formula out when the form has none', () => {
    expect(
      formatFieldMetadataItemInput({ settings: { decimals: 2 } }).formula,
    ).toBeUndefined();
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
