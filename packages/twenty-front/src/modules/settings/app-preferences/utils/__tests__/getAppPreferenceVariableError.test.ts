import { type AppPreferenceVariable } from '@/settings/app-preferences/types/AppPreferenceVariable';
import { getAppPreferenceVariableError } from '@/settings/app-preferences/utils/getAppPreferenceVariableError';
import { FieldMetadataType } from 'twenty-shared/types';

const VARIABLE: AppPreferenceVariable = {
  key: 'DISPLAY_PREFERENCES',
  value: 'MRR',
  label: 'Display preferences',
  description: 'Show ARR or MRR',
  type: FieldMetadataType.SELECT,
  options: [
    { label: 'Annual recurring revenue', value: 'ARR' },
    { label: 'Monthly recurring revenue', value: 'MRR' },
  ],
  isSecret: false,
  isRequired: true,
  isDeprecated: false,
};

describe('getAppPreferenceVariableError', () => {
  it.each([
    { value: 'ARR', error: undefined },
    { value: 'Annual recurring revenue', error: 'INVALID_OPTION' },
    { value: 'Other', error: 'INVALID_OPTION' },
    { value: '', error: 'REQUIRED' },
  ])('validates the declared option value $value', ({ value, error }) => {
    expect(getAppPreferenceVariableError({ variable: VARIABLE, value })).toBe(
      error,
    );
  });

  it('allows an optional preference to be cleared', () => {
    expect(
      getAppPreferenceVariableError({
        variable: { ...VARIABLE, isRequired: false },
        value: '',
      }),
    ).toBeUndefined();
  });

  it.each([
    { value: '0', error: undefined },
    { value: '-3.5', error: undefined },
    { value: '1e2', error: undefined },
    { value: 'not a number', error: 'INVALID_NUMBER' },
    { value: 'Infinity', error: 'INVALID_NUMBER' },
    { value: 'NaN', error: 'INVALID_NUMBER' },
  ])('validates finite number $value', ({ value, error }) => {
    expect(
      getAppPreferenceVariableError({
        variable: { ...VARIABLE, type: FieldMetadataType.NUMBER },
        value,
      }),
    ).toBe(error);
  });

  it.each([
    { value: 'true', error: undefined },
    { value: 'false', error: undefined },
    { value: 'False', error: 'INVALID_BOOLEAN' },
  ])('does not coerce the boolean string $value', ({ value, error }) => {
    expect(
      getAppPreferenceVariableError({
        variable: { ...VARIABLE, type: FieldMetadataType.BOOLEAN },
        value,
      }),
    ).toBe(error);
  });

  it.each([
    { value: '********', error: undefined },
    { value: 'new secret', error: 'INVALID_NUMBER' },
    { value: '', error: 'REQUIRED' },
  ])(
    'validates secret replacements without inspecting the mask',
    ({ value, error }) => {
      expect(
        getAppPreferenceVariableError({
          variable: {
            ...VARIABLE,
            type: FieldMetadataType.NUMBER,
            isSecret: true,
            value: '********',
          },
          value,
        }),
      ).toBe(error);
    },
  );

  it('accepts string values and rejects a missing required string', () => {
    const variable = { ...VARIABLE, type: FieldMetadataType.TEXT };

    expect(
      getAppPreferenceVariableError({ variable, value: 'Customer view' }),
    ).toBeUndefined();
    expect(getAppPreferenceVariableError({ variable, value: ' ' })).toBe(
      'REQUIRED',
    );
  });

  it('does not require fixing an unchanged deprecated preference', () => {
    expect(
      getAppPreferenceVariableError({
        variable: { ...VARIABLE, isDeprecated: true, value: 'REMOVED_OPTION' },
        value: 'REMOVED_OPTION',
      }),
    ).toBeUndefined();
  });
});
