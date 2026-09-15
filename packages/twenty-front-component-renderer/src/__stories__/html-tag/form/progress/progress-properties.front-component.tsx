import { defineFrontComponent } from 'twenty-sdk/define';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { PROPERTY_FIXTURE } from '@/__stories__/shared/front-components/property-fixture';

const ProgressPropertiesFrontComponent = () => (
  <FrontComponentCard title="progress:properties">
    <progress
      data-testid="subject"
      id={PROPERTY_FIXTURE.id}
      className={PROPERTY_FIXTURE.className}
      title={PROPERTY_FIXTURE.title}
      role={PROPERTY_FIXTURE.role}
      aria-label={PROPERTY_FIXTURE.ariaLabel}
      tabIndex={PROPERTY_FIXTURE.tabIndex}
      value={30}
      max={PROPERTY_FIXTURE.max}
    />
  </FrontComponentCard>
);

export default defineFrontComponent({
  universalIdentifier: 'fc-progress-props-00000000-0000-0000-0000-000000000020',
  name: 'progress-properties-front-component',
  description: 'Front component covering property reflection on <progress>',
  component: ProgressPropertiesFrontComponent,
});
