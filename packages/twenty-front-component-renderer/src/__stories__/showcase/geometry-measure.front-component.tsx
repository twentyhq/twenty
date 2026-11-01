import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';

const MEASURED_BOX_WIDTH = 240;
const MEASURED_BOX_HEIGHT = 80;

type MeasuredBoxStyle = CSSProperties & Record<`--${string}`, string>;

const MEASURED_BOX_STYLE: MeasuredBoxStyle = {
  position: 'absolute',
  left: 12,
  top: 14,
  width: MEASURED_BOX_WIDTH,
  height: MEASURED_BOX_HEIGHT,
  backgroundColor: '#dbeafe',
  borderRadius: 8,
  '--measured-accent': 'rgb(1, 2, 3)',
};

const GeometryMeasureComponent = () => {
  const measuredBoxRef = useRef<HTMLDivElement>(null);
  const [measuredGeometry, setMeasuredGeometry] = useState({
    width: 0,
    height: 0,
    offsetWidth: 0,
    innerWidth: 0,
    columnGap: '',
    direction: '',
    display: '',
    offsetLeft: 0,
    offsetTop: 0,
    hasOwnedOffsetParent: false,
    inlineAccent: '',
  });

  useEffect(() => {
    const readMeasuredGeometry = () => {
      const measuredBox = measuredBoxRef.current;

      if (measuredBox === null) {
        return;
      }

      const rect = measuredBox.getBoundingClientRect();

      setMeasuredGeometry({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        offsetWidth: measuredBox.offsetWidth,
        innerWidth: window.innerWidth,
        columnGap: getComputedStyle(measuredBox).columnGap,
        direction: getComputedStyle(measuredBox).direction,
        display: getComputedStyle(measuredBox).display,
        offsetLeft: measuredBox.offsetLeft,
        offsetTop: measuredBox.offsetTop,
        hasOwnedOffsetParent:
          measuredBox.offsetParent === measuredBox.parentElement,
        inlineAccent:
          getComputedStyle(measuredBox).getPropertyValue('--measured-accent'),
      });
    };

    const intervalId = setInterval(readMeasuredGeometry, 50);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      data-testid="geometry-measure-component"
      style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}
    >
      <style>
        {'.c05-measured-layout { display: flex; column-gap: 14px; }'}
      </style>
      <div style={{ position: 'relative', height: 120, direction: 'rtl' }}>
        <div
          className="c05-measured-layout"
          ref={measuredBoxRef}
          data-testid="geometry-measure-box"
          style={MEASURED_BOX_STYLE}
        />
      </div>
      <output data-testid="geometry-layout-facts">
        {JSON.stringify({
          columnGap: measuredGeometry.columnGap,
          direction: measuredGeometry.direction,
          display: measuredGeometry.display,
          offsetLeft: measuredGeometry.offsetLeft,
          offsetTop: measuredGeometry.offsetTop,
          hasOwnedOffsetParent: measuredGeometry.hasOwnedOffsetParent,
          inlineAccent: measuredGeometry.inlineAccent,
        })}
      </output>
      <p data-testid="geometry-measure-width">
        width: {measuredGeometry.width}
      </p>
      <p data-testid="geometry-measure-height">
        height: {measuredGeometry.height}
      </p>
      <p data-testid="geometry-measure-offset-width">
        offsetWidth: {measuredGeometry.offsetWidth}
      </p>
      <p data-testid="geometry-measure-inner-width">
        innerWidth: {measuredGeometry.innerWidth}
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
