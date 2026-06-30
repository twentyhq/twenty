import { defineFrontComponent } from 'twenty-sdk/define';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { PROPERTY_FIXTURE } from '@/__stories__/shared/front-components/property-fixture';

const MeterPropertiesFrontComponent = () => (
  <FrontComponentCard title="meter:properties">
    <meter
      data-testid="subject"
      id={PROPERTY_FIXTURE.id}
      className={PROPERTY_FIXTURE.className}
      title={PROPERTY_FIXTURE.title}
      role={PROPERTY_FIXTURE.role}
      aria-label={PROPERTY_FIXTURE.ariaLabel}
      tabIndex={PROPERTY_FIXTURE.tabIndex}
      value={0.5}
      min={0}
      max={1}
    />
  </FrontComponentCard>
);

export default defineFrontComponent({
  universalIdentifier: 'fc-meter-props-00000000-0000-0000-0000-000000000020',
  name: 'meter-properties-front-component',
  description: 'Front component covering property reflection on <meter>',
  component: MeterPropertiesFrontComponent,
});
