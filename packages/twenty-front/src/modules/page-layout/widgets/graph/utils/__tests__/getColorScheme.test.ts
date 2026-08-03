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

  describe('with valid color name', () => {
    it('should return the color scheme for a valid color name', () => {
      const result = getColorScheme({
        registry: mockRegistry,
        colorName: 'blue',
        colorKey: 'won',
      });

      expect(result).toEqual(mockRegistry.blue);
    });

    it('should normalize uppercase color names to lowercase', () => {
      const result = getColorScheme({
        registry: mockRegistry,
        colorName: 'BLUE' as 'blue',
        colorKey: 'won',
      });

      expect(result).toEqual(mockRegistry.blue);
    });

    it('should normalize mixed case color names', () => {
      const result = getColorScheme({
        registry: mockRegistry,
        colorName: 'Blue' as 'blue',
        colorKey: 'won',
      });

      expect(result).toEqual(mockRegistry.blue);
    });
  });

  describe('with invalid or missing color name', () => {
    it('should hash the color key into the palette', () => {
      const wonResult = getColorScheme({
        registry: mockRegistry,
        colorKey: 'won',
      });
      const openResult = getColorScheme({
        registry: mockRegistry,
        colorKey: 'open',
      });
      const lostResult = getColorScheme({
        registry: mockRegistry,
        colorKey: 'lost',
      });

      expect(wonResult.name).toBe('green');
      expect(openResult.name).toBe('red');
      expect(lostResult.name).toBe('blue');
    });

    it('should hash the color key when color name is not in registry', () => {
      const result = getColorScheme({
        registry: mockRegistry,
        colorName: 'invalidColor' as 'blue',
        colorKey: 'won',
      });

      expect(result.name).toBe('green');
    });

    it('should return the same color for the same key on every call', () => {
      const first = getColorScheme({ registry: mockRegistry, colorKey: 'won' });
      const second = getColorScheme({
        registry: mockRegistry,
        colorKey: 'won',
      });

      expect(first).toEqual(second);
    });
  });

  describe('with totalGroups parameter', () => {
    it('should generate a group color when totalGroups is provided', () => {
      const result = getColorScheme({
        registry: mockRegistry,
        colorName: 'blue',
        colorKey: 'won',
        groupIndex: 0,
        totalGroups: 5,
      });

      expect(result.name).toBe('blue');
      expect(result.variations).toEqual(mockRegistry.blue.variations);
    });

    it('should use groupIndex for group color generation', () => {
      const result1 = getColorScheme({
        registry: mockRegistry,
        colorName: 'green',
        colorKey: 'won',
        groupIndex: 0,
        totalGroups: 3,
      });

      const result2 = getColorScheme({
        registry: mockRegistry,
        colorName: 'green',
        colorKey: 'lost',
        groupIndex: 2,
        totalGroups: 3,
      });

      expect(result1.solid).not.toBe(result2.solid);
    });

    it('should throw when groupIndex is missing', () => {
      expect(() =>
        getColorScheme({
          registry: mockRegistry,
          colorName: 'green',
          colorKey: 'won',
          totalGroups: 3,
        }),
      ).toThrow('Missing groupIndex for color key "won"');
    });
  });
});
