import { defineFrontComponent } from 'twenty-sdk/define';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { PROPERTY_FIXTURE } from '@/__stories__/shared/front-components/property-fixture';

const noop = () => undefined;

const SelectPropertiesFrontComponent = () => (
  <FrontComponentCard title="select:properties">
    <select
      data-testid="subject"
      id={PROPERTY_FIXTURE.id}
      className={PROPERTY_FIXTURE.className}
      title={PROPERTY_FIXTURE.title}
      role={PROPERTY_FIXTURE.role}
      aria-label={PROPERTY_FIXTURE.ariaLabel}
      tabIndex={PROPERTY_FIXTURE.tabIndex}
      name={PROPERTY_FIXTURE.name}
      value="alpha"
      onChange={noop}
    >
      <option value="alpha">alpha</option>
      <option value="beta">beta</option>
    </select>
  </FrontComponentCard>
);

export default defineFrontComponent({
  universalIdentifier: 'fc-slct-props-00000000-0000-0000-0000-000000000020',
  name: 'select-properties-front-component',
  description: 'Front component covering property reflection on <select>',
  component: SelectPropertiesFrontComponent,
});
