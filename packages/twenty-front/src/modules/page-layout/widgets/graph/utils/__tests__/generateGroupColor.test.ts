import { GRAPH_COLOR_SCALE_MAX } from '@/page-layout/widgets/graph/constants/GraphColorScaleMax';
import { GRAPH_COLOR_SCALE_MIN } from '@/page-layout/widgets/graph/constants/GraphColorScaleMinIndex';
import { GRAPH_MAXIMUM_NUMBER_OF_GROUP_COLORS } from '@/page-layout/widgets/graph/constants/GraphMaximumNumberOfGroupColors';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';
import { generateGroupColor } from '@/page-layout/widgets/graph/utils/generateGroupColor';

const mockColorScheme: GraphColorScheme = {
  name: 'test',
  solid: '#solid',
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
};

describe('generateGroupColor', () => {
  describe('single group case', () => {
    it('should return solid color when totalGroups is 1', () => {
      const result = generateGroupColor({
        colorScheme: mockColorScheme,
        groupIndex: 0,
        totalGroups: 1,
      });

      expect(result).toBe('#solid');
    });

    it('should return solid color when totalGroups is 0', () => {
      const result = generateGroupColor({
        colorScheme: mockColorScheme,
        groupIndex: 0,
        totalGroups: 0,
      });

      expect(result).toBe('#solid');
    });
  });

  describe('multiple groups case', () => {
    it('should return a variation color for multiple groups', () => {
      const result = generateGroupColor({
        colorScheme: mockColorScheme,
        groupIndex: 0,
        totalGroups: 3,
      });

      expect(result).toMatch(/^#v\d+$/);
    });

    it('should return different colors for different group indices', () => {
      const results = [0, 1, 2].map((groupIndex) =>
        generateGroupColor({
          colorScheme: mockColorScheme,
          groupIndex,
          totalGroups: 3,
        }),
      );

      expect(results[0]).not.toBe(results[1]);
      expect(results[1]).not.toBe(results[2]);
    });

    it('should use variation indices within the defined scale range', () => {
      const result = generateGroupColor({
        colorScheme: mockColorScheme,
        groupIndex: 0,
        totalGroups: 5,
      });

      const variationIndex = mockColorScheme.variations.indexOf(result);

      expect(variationIndex).toBeGreaterThanOrEqual(GRAPH_COLOR_SCALE_MIN - 1);
      expect(variationIndex).toBeLessThanOrEqual(GRAPH_COLOR_SCALE_MAX);
    });
  });

  describe('group index wrapping', () => {
    it('should wrap group index when exceeding maximum', () => {
      const result = generateGroupColor({
        colorScheme: mockColorScheme,
        groupIndex: GRAPH_MAXIMUM_NUMBER_OF_GROUP_COLORS + 1,
        totalGroups: 10,
      });

      expect(result).toMatch(/^#v\d+$/);
    });
  });

  describe('total groups capping', () => {
    it('should cap total groups to maximum number of colors', () => {
      const result = generateGroupColor({
        colorScheme: mockColorScheme,
        groupIndex: 0,
        totalGroups: 100,
      });

      expect(result).toMatch(/^#v\d+$/);
    });
  });
});
