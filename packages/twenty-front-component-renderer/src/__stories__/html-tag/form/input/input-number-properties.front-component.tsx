import { defineFrontComponent } from 'twenty-sdk/define';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { PROPERTY_FIXTURE } from '@/__stories__/shared/front-components/property-fixture';

const noop = () => undefined;

const InputNumberPropertiesFrontComponent = () => (
  <FrontComponentCard title="input:number:properties">
    <input
      data-testid="subject"
      id={PROPERTY_FIXTURE.id}
      className={PROPERTY_FIXTURE.className}
      title={PROPERTY_FIXTURE.title}
      role={PROPERTY_FIXTURE.role}
      aria-label={PROPERTY_FIXTURE.ariaLabel}
      tabIndex={PROPERTY_FIXTURE.tabIndex}
      type="number"
      name={PROPERTY_FIXTURE.name}
      value={String(PROPERTY_FIXTURE.numberValue)}
      onChange={noop}
    />
  </FrontComponentCard>
);

export default defineFrontComponent({
  universalIdentifier:
    'fc-input-num-props-00000000-0000-0000-0000-000000000020',
  name: 'input-number-properties-front-component',
  description:
    'Front component covering property reflection on <input type="number">',
  component: InputNumberPropertiesFrontComponent,
});
