import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';
import { getColorSchemeByIndex } from '@/page-layout/widgets/graph/utils/getColorSchemeByIndex';

const createMockColorScheme = (name: string): GraphColorScheme => ({
  name,
  solid: `#${name}`,
  variations: [
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
    '#v12',
  ],
});

describe('getColorSchemeByIndex', () => {
  const mockRegistry: GraphColorRegistry = {
    green: createMockColorScheme('green'),
    blue: createMockColorScheme('blue'),
    red: createMockColorScheme('red'),
  };

  it('should return first color scheme for index 0', () => {
    const result = getColorSchemeByIndex(mockRegistry, 0);

    expect(result).toEqual(mockRegistry.green);
  });

  it('should return second color scheme for index 1', () => {
    const result = getColorSchemeByIndex(mockRegistry, 1);

    expect(result).toEqual(mockRegistry.blue);
  });

  it('should return third color scheme for index 2', () => {
    const result = getColorSchemeByIndex(mockRegistry, 2);

    expect(result).toEqual(mockRegistry.red);
  });

  it('should wrap around when index exceeds registry length', () => {
    const result = getColorSchemeByIndex(mockRegistry, 3);

    expect(result).toEqual(mockRegistry.green);
  });

  it('should handle large indices by wrapping', () => {
    const result = getColorSchemeByIndex(mockRegistry, 10);

    expect(result).toEqual(mockRegistry.blue);
  });

  describe('edge cases', () => {
    it('should handle single-item registry', () => {
      const singleRegistry: GraphColorRegistry = {
        single: createMockColorScheme('single'),
      };

      expect(getColorSchemeByIndex(singleRegistry, 0)).toEqual(
        singleRegistry.single,
      );
      expect(getColorSchemeByIndex(singleRegistry, 1)).toEqual(
        singleRegistry.single,
      );
      expect(getColorSchemeByIndex(singleRegistry, 5)).toEqual(
        singleRegistry.single,
      );
    });
  });
});
