import { isDefined } from 'twenty-shared/utils';

import { type SnapshotBoxDimensions } from '@/polyfills/geometry/types/SnapshotBoxDimensions';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

export const resolveSvgBoxDimensions = ({
  svgBoundingBoxWidth,
  svgBoundingBoxHeight,
}: ElementGeometrySnapshot): SnapshotBoxDimensions | null =>
  isDefined(svgBoundingBoxWidth) && isDefined(svgBoundingBoxHeight)
    ? {
        contentBox: {
          x: 0,
          y: 0,
          width: svgBoundingBoxWidth,
          height: svgBoundingBoxHeight,
        },
        borderBox: { width: svgBoundingBoxWidth, height: svgBoundingBoxHeight },
      }
    : null;
