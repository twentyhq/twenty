import { useEffect, useRef, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';

const MEASURED_BOX_WIDTH = 240;
const MEASURED_BOX_HEIGHT = 80;

const GeometryMeasureComponent = () => {
  const measuredBoxRef = useRef<HTMLDivElement>(null);
  const [measuredSize, setMeasuredSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const readMeasuredSize = () => {
      const measuredBox = measuredBoxRef.current;

      if (measuredBox === null) {
        return;
      }

      const rect = measuredBox.getBoundingClientRect();

      setMeasuredSize({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    };

    const intervalId = setInterval(readMeasuredSize, 50);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      data-testid="geometry-measure-component"
      style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}
    >
      <div
        ref={measuredBoxRef}
        data-testid="geometry-measure-box"
        style={{
          width: MEASURED_BOX_WIDTH,
          height: MEASURED_BOX_HEIGHT,
          backgroundColor: '#dbeafe',
          borderRadius: 8,
        }}
      />
      <p data-testid="geometry-measure-width">width: {measuredSize.width}</p>
      <p data-testid="geometry-measure-height">height: {measuredSize.height}</p>
      <p data-testid="geometry-measure-offset-width">
        offsetWidth: {measuredBoxRef.current?.offsetWidth ?? 0}
      </p>
      <p data-testid="geometry-measure-inner-width">
        innerWidth: {typeof window === 'undefined' ? 0 : window.innerWidth}
      </p>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-geometry-measure-0000-0000-0000-000000000001',
  name: 'geometry-measure-component',
  description: 'Front component reading its own geometry from the host mirror',
  component: GeometryMeasureComponent,
});
