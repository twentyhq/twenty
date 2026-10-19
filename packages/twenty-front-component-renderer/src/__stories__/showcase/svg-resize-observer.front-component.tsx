import { useEffect, useRef, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';

const INITIAL_RECTANGLE_WIDTH = 80;
const GROWN_RECTANGLE_WIDTH = 120;
const RECTANGLE_HEIGHT = 40;
const SVG_WIDTH = 200;
const SVG_HEIGHT = 120;

type ObservedBoxSize = { inlineSize: number; blockSize: number } | null;

const readObservedBoxSize = (
  boxSizes: ReadonlyArray<ResizeObserverSize>,
): ObservedBoxSize => {
  const [boxSize] = boxSizes;

  return isDefined(boxSize)
    ? { inlineSize: boxSize.inlineSize, blockSize: boxSize.blockSize }
    : null;
};

const formatObservedBoxSize = (boxSize: ObservedBoxSize): string =>
  isDefined(boxSize) ? `${boxSize.inlineSize}x${boxSize.blockSize}` : 'pending';

const SvgResizeObserverComponent = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const rectangleRef = useRef<SVGRectElement>(null);
  const [rectangleWidth, setRectangleWidth] = useState(INITIAL_RECTANGLE_WIDTH);
  const [svgBorderBoxSize, setSvgBorderBoxSize] =
    useState<ObservedBoxSize>(null);
  const [groupContentBoxSize, setGroupContentBoxSize] =
    useState<ObservedBoxSize>(null);
  const [rectangleContentBoxSize, setRectangleContentBoxSize] =
    useState<ObservedBoxSize>(null);
  const [rectangleNotificationCount, setRectangleNotificationCount] =
    useState(0);

  useEffect(() => {
    const svg = svgRef.current;
    const group = groupRef.current;
    const rectangle = rectangleRef.current;

    if (!isDefined(svg) || !isDefined(group) || !isDefined(rectangle)) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === svg) {
          setSvgBorderBoxSize(readObservedBoxSize(entry.borderBoxSize));
        }

        if (entry.target === group) {
          setGroupContentBoxSize(readObservedBoxSize(entry.contentBoxSize));
        }

        if (entry.target === rectangle) {
          setRectangleContentBoxSize(readObservedBoxSize(entry.contentBoxSize));
          setRectangleNotificationCount((count) => count + 1);
        }
      }
    });

    observer.observe(svg);
    observer.observe(group);
    observer.observe(rectangle);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      data-testid="svg-resize-observer-component"
      style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}
    >
      <svg
        ref={svgRef}
        data-testid="svg-resize-observer-svg"
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      >
        <g ref={groupRef} data-testid="svg-resize-observer-group">
          <rect
            ref={rectangleRef}
            data-testid="svg-resize-observer-rect"
            x={10}
            y={20}
            width={rectangleWidth}
            height={RECTANGLE_HEIGHT}
            fill="#2563eb"
          />
        </g>
      </svg>
      <div>
        <button
          type="button"
          data-testid="svg-resize-observer-grow"
          onClick={() => setRectangleWidth(GROWN_RECTANGLE_WIDTH)}
        >
          Grow rect
        </button>
      </div>
      <p data-testid="svg-resize-observer-svg-size">
        svg: {formatObservedBoxSize(svgBorderBoxSize)}
      </p>
      <p data-testid="svg-resize-observer-group-size">
        group: {formatObservedBoxSize(groupContentBoxSize)}
      </p>
      <p data-testid="svg-resize-observer-rect-size">
        rect: {formatObservedBoxSize(rectangleContentBoxSize)}
      </p>
      <p data-testid="svg-resize-observer-rect-notifications">
        rect notifications: {rectangleNotificationCount}
      </p>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-svg-resize-observer-0000-0000-0000-000000000001',
  name: 'svg-resize-observer-component',
  description:
    'Front component observing SVG shape sizes through the worker ResizeObserver',
  component: SvgResizeObserverComponent,
});
