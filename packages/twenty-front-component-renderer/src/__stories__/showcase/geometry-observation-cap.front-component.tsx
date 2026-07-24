import { useEffect, useRef, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';

const MEASURED_ELEMENT_COUNT = 1000;

const GeometryObservationCapComponent = () => {
  const measuredBoxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [mountGeneration, setMountGeneration] = useState(0);
  const [measuredCount, setMeasuredCount] = useState(0);

  useEffect(() => {
    const countMeasuredBoxes = () => {
      const nonZeroCount = measuredBoxRefs.current.filter(
        (measuredBox) =>
          measuredBox !== null && measuredBox.getBoundingClientRect().width > 0,
      ).length;

      setMeasuredCount(nonZeroCount);
    };

    const intervalId = setInterval(countMeasuredBoxes, 100);

    return () => clearInterval(intervalId);
  }, [mountGeneration]);

  return (
    <div
      data-testid="geometry-observation-cap-component"
      style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}
    >
      <p data-testid="geometry-observation-cap-count">
        measured: {measuredCount}
      </p>
      <button
        data-testid="geometry-observation-cap-remount"
        onClick={() => {
          measuredBoxRefs.current = [];
          setMeasuredCount(0);
          setMountGeneration((previous) => previous + 1);
        }}
      >
        Remount
      </button>
      <div key={mountGeneration}>
        {Array.from({ length: MEASURED_ELEMENT_COUNT }, (_, index) => (
          <div
            key={index}
            ref={(measuredBox) => {
              measuredBoxRefs.current[index] = measuredBox;
            }}
            style={{ width: 10, height: 1 }}
          />
        ))}
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-geometry-cap-00000-0000-0000-000000000003',
  name: 'geometry-observation-cap-component',
  description: 'Front component measuring more elements than the observe cap',
  component: GeometryObservationCapComponent,
});
