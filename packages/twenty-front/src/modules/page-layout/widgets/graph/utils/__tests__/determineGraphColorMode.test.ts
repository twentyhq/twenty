import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { determineGraphColorMode } from '@/page-layout/widgets/graph/utils/determineGraphColorMode';

describe('determineGraphColorMode', () => {
  const mockSelectOptions: FieldMetadataItemOption[] = [
    { id: '1', value: 'ACTIVE', label: 'Active', position: 0, color: 'green' },
    {
      id: '2',
      value: 'INACTIVE',
      label: 'Inactive',
      position: 1,
      color: 'red',
    },
  ];

  describe('explicitSingleColor mode', () => {
    it('should return explicitSingleColor when configurationColor is set and not "auto"', () => {
      expect(
        determineGraphColorMode({
          configurationColor: 'blue',
          selectFieldOptions: mockSelectOptions,
        }),
      ).toBe('explicitSingleColor');
    });

    it('should return explicitSingleColor for any valid color string', () => {
      expect(
        determineGraphColorMode({
          configurationColor: 'red',
          selectFieldOptions: null,
        }),
      ).toBe('explicitSingleColor');
    });
  });

  describe('selectFieldOptionColors mode', () => {
    it('should return selectFieldOptionColors when configurationColor is "auto" and options exist', () => {
      expect(
        determineGraphColorMode({
          configurationColor: 'auto',
          selectFieldOptions: mockSelectOptions,
        }),
      ).toBe('selectFieldOptionColors');
    });

    it('should return selectFieldOptionColors when configurationColor is null and options exist', () => {
      expect(
        determineGraphColorMode({
          configurationColor: null,
          selectFieldOptions: mockSelectOptions,
        }),
      ).toBe('selectFieldOptionColors');
    });

    it('should return selectFieldOptionColors when configurationColor is undefined and options exist', () => {
      expect(
        determineGraphColorMode({
          configurationColor: undefined,
          selectFieldOptions: mockSelectOptions,
        }),
      ).toBe('selectFieldOptionColors');
    });
  });

  describe('automaticPalette mode', () => {
    it('should return automaticPalette when configurationColor is "auto" and no options', () => {
      expect(
        determineGraphColorMode({
          configurationColor: 'auto',
          selectFieldOptions: null,
        }),
      ).toBe('automaticPalette');
    });

    it('should return automaticPalette when configurationColor is null and no options', () => {
      expect(
        determineGraphColorMode({
          configurationColor: null,
          selectFieldOptions: null,
        }),
      ).toBe('automaticPalette');
    });

    it('should return automaticPalette when configurationColor is undefined and no options', () => {
      expect(
        determineGraphColorMode({
          configurationColor: undefined,
          selectFieldOptions: undefined,
        }),
      ).toBe('automaticPalette');
    });

    it('should return automaticPalette when options array is empty', () => {
      expect(
        determineGraphColorMode({
          configurationColor: 'auto',
          selectFieldOptions: [],
        }),
      ).toBe('automaticPalette');
    });
  });
});
