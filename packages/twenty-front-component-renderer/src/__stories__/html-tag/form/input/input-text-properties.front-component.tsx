import { defineFrontComponent } from 'twenty-sdk/define';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { PROPERTY_FIXTURE } from '@/__stories__/shared/front-components/property-fixture';

const noop = () => undefined;

const InputTextPropertiesFrontComponent = () => (
  <FrontComponentCard title="input:text:properties">
    <input
      data-testid="subject"
      id={PROPERTY_FIXTURE.id}
      className={PROPERTY_FIXTURE.className}
      title={PROPERTY_FIXTURE.title}
      role={PROPERTY_FIXTURE.role}
      aria-label={PROPERTY_FIXTURE.ariaLabel}
      tabIndex={PROPERTY_FIXTURE.tabIndex}
      type={PROPERTY_FIXTURE.type}
      name={PROPERTY_FIXTURE.name}
      placeholder={PROPERTY_FIXTURE.placeholder}
      value={PROPERTY_FIXTURE.textValue}
      onChange={noop}
    />
  </FrontComponentCard>
);

export default defineFrontComponent({
  universalIdentifier:
    'fc-input-text-props-00000000-0000-0000-0000-000000000020',
  name: 'input-text-properties-front-component',
  description:
    'Front component covering property reflection on <input type="text">',
  component: InputTextPropertiesFrontComponent,
});
