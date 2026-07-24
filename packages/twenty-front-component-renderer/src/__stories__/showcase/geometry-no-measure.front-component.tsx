import { defineFrontComponent } from 'twenty-sdk/define';

const GeometryNoMeasureComponent = () => (
  <div
    data-testid="geometry-no-measure-component"
    style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}
  >
    <p>This component never reads any layout metric.</p>
  </div>
);

export default defineFrontComponent({
  universalIdentifier: 'fc-geometry-nomeasure-0000-0000-0000-000000000002',
  name: 'geometry-no-measure-component',
  description: 'Front component that never reads layout metrics',
  component: GeometryNoMeasureComponent,
});
