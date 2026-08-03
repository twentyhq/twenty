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
        colorIndex: 0,
      });

      expect(result).toEqual(mockRegistry.blue);
    });

    it('should normalize uppercase color names to lowercase', () => {
      const result = getColorScheme({
        registry: mockRegistry,
        colorName: 'BLUE' as 'blue',
        colorIndex: 0,
      });

      expect(result).toEqual(mockRegistry.blue);
    });

    it('should normalize mixed case color names', () => {
      const result = getColorScheme({
        registry: mockRegistry,
        colorName: 'Blue' as 'blue',
        colorIndex: 0,
      });

      expect(result).toEqual(mockRegistry.blue);
    });
  });

  describe('with invalid or missing color name', () => {
    it('should return the color scheme at the provided index', () => {
      const firstResult = getColorScheme({
        registry: mockRegistry,
        colorIndex: 0,
      });
      const secondResult = getColorScheme({
        registry: mockRegistry,
        colorIndex: 1,
      });
      const thirdResult = getColorScheme({
        registry: mockRegistry,
        colorIndex: 2,
      });

      expect(firstResult.name).toBe('blue');
      expect(secondResult.name).toBe('green');
      expect(thirdResult.name).toBe('red');
    });

    it('should use the provided index when color name is not in registry', () => {
      const result = getColorScheme({
        registry: mockRegistry,
        colorName: 'invalidColor' as 'blue',
        colorIndex: 1,
      });

      expect(result.name).toBe('green');
    });

    it('should return the same color for the same index on every call', () => {
      const first = getColorScheme({ registry: mockRegistry, colorIndex: 1 });
      const second = getColorScheme({
        registry: mockRegistry,
        colorIndex: 1,
      });

      expect(first).toEqual(second);
    });
  });

  describe('with totalGroups parameter', () => {
    it('should generate a group color when totalGroups is provided', () => {
      const result = getColorScheme({
        registry: mockRegistry,
        colorName: 'blue',
        colorIndex: 0,
        totalGroups: 5,
      });

      expect(result.name).toBe('blue');
      expect(result.variations).toEqual(mockRegistry.blue.variations);
    });

    it('should use colorIndex for group color generation', () => {
      const result1 = getColorScheme({
        registry: mockRegistry,
        colorName: 'green',
        colorIndex: 0,
        totalGroups: 3,
      });

      const result2 = getColorScheme({
        registry: mockRegistry,
        colorName: 'green',
        colorIndex: 2,
        totalGroups: 3,
      });

      expect(result1.solid).not.toBe(result2.solid);
    });
  });
});
