import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { getColorScheme } from '@/page-layout/widgets/graph/utils/getColorScheme';

describe('getColorScheme', () => {
  const mockRegistry: GraphColorRegistry = {
    blue: {
      name: 'blue',
      solid: '#solidBlue',
      variations: [
        '#v0',
        '#v1',
        '#v2',
        '#v3',
        '#v4',
        '#v5',
        '#v6',
        '#v7',
        '#v8',
        '#v9',
        '#v10',
        '#v11',
      ],
    },
    green: {
      name: 'green',
      solid: '#solidGreen',
      variations: [
        '#v0',
        '#v1',
        '#v2',
        '#v3',
        '#v4',
        '#v5',
        '#v6',
        '#v7',
        '#v8',
        '#v9',
        '#v10',
        '#v11',
      ],
    },
    red: {
      name: 'red',
      solid: '#solidRed',
      variations: [
        '#v0',
        '#v1',
        '#v2',
        '#v3',
        '#v4',
        '#v5',
        '#v6',
        '#v7',
        '#v8',
        '#v9',
        '#v10',
        '#v11',
      ],
    },
  } as unknown as GraphColorRegistry;

  const alphabeticalRankByKey = new Map([
    ['alpha', 0],
    ['beta', 1],
    ['gamma', 2],
  ]);

  describe('with valid color name', () => {
    it('should return the color scheme for a valid color name', () => {
      const result = getColorScheme({
        registry: mockRegistry,
        colorName: 'blue',
        colorKey: 'alpha',
        colorMode: 'selectFieldOptionColors',
        alphabeticalRankByKey,
      });

      expect(result).toEqual(mockRegistry.blue);
    });

    it('should normalize uppercase color names to lowercase', () => {
      const result = getColorScheme({
        registry: mockRegistry,
        colorName: 'BLUE' as 'blue',
        colorKey: 'alpha',
        colorMode: 'selectFieldOptionColors',
        alphabeticalRankByKey,
      });

      expect(result).toEqual(mockRegistry.blue);
    });

    it('should normalize mixed case color names', () => {
      const result = getColorScheme({
        registry: mockRegistry,
        colorName: 'Blue' as 'blue',
        colorKey: 'alpha',
        colorMode: 'selectFieldOptionColors',
        alphabeticalRankByKey,
      });

      expect(result).toEqual(mockRegistry.blue);
    });
  });

  describe('with invalid or missing color name', () => {
    it('should return the color scheme at the alphabetical rank', () => {
      const firstResult = getColorScheme({
        registry: mockRegistry,
        colorKey: 'alpha',
        colorMode: 'automaticPalette',
        alphabeticalRankByKey,
      });
      const secondResult = getColorScheme({
        registry: mockRegistry,
        colorKey: 'beta',
        colorMode: 'automaticPalette',
        alphabeticalRankByKey,
      });
      const thirdResult = getColorScheme({
        registry: mockRegistry,
        colorKey: 'gamma',
        colorMode: 'automaticPalette',
        alphabeticalRankByKey,
      });

      expect(firstResult.name).toBe('blue');
      expect(secondResult.name).toBe('green');
      expect(thirdResult.name).toBe('red');
    });

    it('should use the alphabetical rank when color name is not in registry', () => {
      const result = getColorScheme({
        registry: mockRegistry,
        colorName: 'invalidColor' as 'blue',
        colorKey: 'beta',
        colorMode: 'automaticPalette',
        alphabeticalRankByKey,
      });

      expect(result.name).toBe('green');
    });

    it('should return the same color for the same key on every call', () => {
      const first = getColorScheme({
        registry: mockRegistry,
        colorKey: 'beta',
        colorMode: 'automaticPalette',
        alphabeticalRankByKey,
      });
      const second = getColorScheme({
        registry: mockRegistry,
        colorKey: 'beta',
        colorMode: 'automaticPalette',
        alphabeticalRankByKey,
      });

      expect(first).toEqual(second);
    });

    it('should throw when the color key has no alphabetical rank', () => {
      expect(() =>
        getColorScheme({
          registry: mockRegistry,
          colorKey: 'missing',
          colorMode: 'automaticPalette',
          alphabeticalRankByKey,
        }),
      ).toThrow('Missing alphabetical rank for color key "missing"');
    });
  });

  describe('with explicit single color mode', () => {
    it('should generate a group color', () => {
      const result = getColorScheme({
        registry: mockRegistry,
        colorName: 'blue',
        colorKey: 'alpha',
        colorMode: 'explicitSingleColor',
        alphabeticalRankByKey,
      });

      expect(result.name).toBe('blue');
      expect(result.variations).toEqual(mockRegistry.blue.variations);
    });

    it('should use alphabetical rank for group color generation', () => {
      const result1 = getColorScheme({
        registry: mockRegistry,
        colorName: 'green',
        colorKey: 'alpha',
        colorMode: 'explicitSingleColor',
        alphabeticalRankByKey,
      });

      const result2 = getColorScheme({
        registry: mockRegistry,
        colorName: 'green',
        colorKey: 'gamma',
        colorMode: 'explicitSingleColor',
        alphabeticalRankByKey,
      });

      expect(result1.solid).not.toBe(result2.solid);
    });
  });
});
