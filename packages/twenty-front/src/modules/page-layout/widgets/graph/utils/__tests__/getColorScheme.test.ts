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
      });

      expect(result).toEqual(mockRegistry.blue);
    });

    it('should normalize uppercase color names to lowercase', () => {
      const result = getColorScheme({
        registry: mockRegistry,
        colorName: 'BLUE' as 'blue',
      });

      expect(result).toEqual(mockRegistry.blue);
    });

    it('should normalize mixed case color names', () => {
      const result = getColorScheme({
        registry: mockRegistry,
        colorName: 'Blue' as 'blue',
      });

      expect(result).toEqual(mockRegistry.blue);
    });
  });

  describe('with invalid or missing color name', () => {
    it('should return color scheme by fallback index when color name is undefined', () => {
      const result = getColorScheme({
        registry: mockRegistry,
        colorName: undefined,
        fallbackIndex: 0,
      });

      expect(result.name).toBeDefined();
    });

    it('should return color scheme by fallback index when color name is not in registry', () => {
      const result = getColorScheme({
        registry: mockRegistry,
        colorName: 'invalidColor' as 'blue',
        fallbackIndex: 1,
      });

      expect(result.name).toBeDefined();
    });

    it('should use fallback index 0 when not provided', () => {
      const result = getColorScheme({
        registry: mockRegistry,
        colorName: undefined,
      });

      expect(result.name).toBeDefined();
    });
  });

  describe('with totalGroups parameter', () => {
    it('should generate a group color when totalGroups is provided', () => {
      const result = getColorScheme({
        registry: mockRegistry,
        colorName: 'blue',
        fallbackIndex: 0,
        totalGroups: 5,
      });

      expect(result.name).toBe('blue');
      expect(result.variations).toEqual(mockRegistry.blue.variations);
    });

    it('should use fallbackIndex for group color generation', () => {
      const result1 = getColorScheme({
        registry: mockRegistry,
        colorName: 'green',
        fallbackIndex: 0,
        totalGroups: 3,
      });

      const result2 = getColorScheme({
        registry: mockRegistry,
        colorName: 'green',
        fallbackIndex: 2,
        totalGroups: 3,
      });

      expect(result1.solid).not.toBe(result2.solid);
    });
  });
});
