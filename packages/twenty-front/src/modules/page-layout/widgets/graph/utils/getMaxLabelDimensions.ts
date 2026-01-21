import { measureTextDimensions } from '@/page-layout/widgets/graph/utils/measureTextDimensions';

type Dimensions = {
  width: number;
  height: number;
};

export const getMaxLabelDimensions = ({
  labels,
  fontSize,
  fontFamily,
}: {
  labels?: string[];
  fontSize: number;
  fontFamily?: string;
}): Dimensions => {
  if (!labels || labels.length === 0) {
    return { width: 0, height: 0 };
  }

  return labels.reduce(
    (maxDimensions, label) => {
      const { width, height } = measureTextDimensions({
        text: label,
        fontSize,
        fontFamily,
      });

      return {
        width: Math.max(maxDimensions.width, width),
        height: Math.max(maxDimensions.height, height),
      };
    },
    { width: 0, height: 0 },
  );
};
