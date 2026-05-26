import { defineFrontComponent } from 'twenty-sdk/define';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { PROPERTY_FIXTURE } from '@/__stories__/shared/front-components/property-fixture';

const ButtonPropertiesFrontComponent = () => (
  <FrontComponentCard title="button:properties">
    <button
      data-testid="subject"
      type="button"
      id={PROPERTY_FIXTURE.id}
      className={PROPERTY_FIXTURE.className}
      title={PROPERTY_FIXTURE.title}
      role={PROPERTY_FIXTURE.role}
      aria-label={PROPERTY_FIXTURE.ariaLabel}
      tabIndex={PROPERTY_FIXTURE.tabIndex}
    >
      button
    </button>
  </FrontComponentCard>
);

export default defineFrontComponent({
  universalIdentifier: 'fc-btn-props-00000000-0000-0000-0000-000000000020',
  name: 'button-properties-front-component',
  description: 'Front component covering property reflection on <button>',
  component: ButtonPropertiesFrontComponent,
});
