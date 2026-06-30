import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { getSelectOptionColorForValue } from '@/page-layout/widgets/graph/utils/getSelectOptionColorForValue';

describe('getSelectOptionColorForValue', () => {
  const mockOptions: FieldMetadataItemOption[] = [
    { id: '1', value: 'ACTIVE', label: 'Active', position: 0, color: 'green' },
    {
      id: '2',
      value: 'INACTIVE',
      label: 'Inactive',
      position: 1,
      color: 'red',
    },
  ];

  it('should return the color for a matching option value', () => {
    expect(
      getSelectOptionColorForValue({
        rawValue: 'ACTIVE',
        selectOptions: mockOptions,
      }),
    ).toBe('green');
  });

  it('should return undefined when rawValue is null or undefined', () => {
    expect(
      getSelectOptionColorForValue({
        rawValue: null,
        selectOptions: mockOptions,
      }),
    ).toBeUndefined();

    expect(
      getSelectOptionColorForValue({
        rawValue: undefined,
        selectOptions: mockOptions,
      }),
    ).toBeUndefined();
  });

  it('should return undefined when selectOptions is null, undefined, or empty', () => {
    expect(
      getSelectOptionColorForValue({
        rawValue: 'ACTIVE',
        selectOptions: null,
      }),
    ).toBeUndefined();

    expect(
      getSelectOptionColorForValue({
        rawValue: 'ACTIVE',
        selectOptions: undefined,
      }),
    ).toBeUndefined();

    expect(
      getSelectOptionColorForValue({
        rawValue: 'ACTIVE',
        selectOptions: [],
      }),
    ).toBeUndefined();
  });

  it('should return undefined when value does not match any option', () => {
    expect(
      getSelectOptionColorForValue({
        rawValue: 'UNKNOWN',
        selectOptions: mockOptions,
      }),
    ).toBeUndefined();
  });

  it('should return undefined when matching option has no color', () => {
    const optionsWithoutColor = [
      { id: '1', value: 'NO_COLOR', label: 'No Color', position: 0 },
    ] as FieldMetadataItemOption[];

    expect(
      getSelectOptionColorForValue({
        rawValue: 'NO_COLOR',
        selectOptions: optionsWithoutColor,
      }),
    ).toBeUndefined();
  });
});
