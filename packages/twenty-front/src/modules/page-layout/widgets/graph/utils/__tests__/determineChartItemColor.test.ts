import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { determineChartItemColor } from '@/page-layout/widgets/graph/utils/determineChartItemColor';

describe('determineChartItemColor', () => {
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

  describe('priority 1: explicit configuration color', () => {
    it('should return configurationColor when set and not "auto"', () => {
      expect(
        determineChartItemColor({
          configurationColor: 'blue',
          selectOptions: mockOptions,
          rawValue: 'ACTIVE', // Would be 'green' if select option was used
        }),
      ).toBe('blue');
    });
  });

  describe('priority 2: select option color', () => {
    it('should use select option color when configurationColor is "auto"', () => {
      expect(
        determineChartItemColor({
          configurationColor: 'auto',
          selectOptions: mockOptions,
          rawValue: 'ACTIVE',
        }),
      ).toBe('green');
    });

    it.each([null, undefined])(
      'should use select option color when configurationColor is %s (null and undefined handled identically)',
      (configurationColor) => {
        expect(
          determineChartItemColor({
            configurationColor,
            selectOptions: mockOptions,
            rawValue: 'INACTIVE',
          }),
        ).toBe('red');
      },
    );
  });

  describe('priority 3: return undefined (no fallback)', () => {
    it('should return undefined when no match and no selectOptions', () => {
      expect(
        determineChartItemColor({
          configurationColor: 'auto',
          selectOptions: undefined,
          rawValue: 'ACTIVE',
        }),
      ).toBeUndefined();
    });

    it('should return undefined when rawValue does not match any option', () => {
      expect(
        determineChartItemColor({
          configurationColor: 'auto',
          selectOptions: mockOptions,
          rawValue: 'UNKNOWN',
        }),
      ).toBeUndefined();
    });

    it('should return undefined when rawValue is null', () => {
      expect(
        determineChartItemColor({
          configurationColor: 'auto',
          selectOptions: mockOptions,
          rawValue: null,
        }),
      ).toBeUndefined();
    });
  });
});
