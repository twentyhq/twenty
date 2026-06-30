import { defineFrontComponent } from 'twenty-sdk/define';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { PROPERTY_FIXTURE } from '@/__stories__/shared/front-components/property-fixture';

const NavPropertiesFrontComponent = () => (
  <FrontComponentCard title="nav:properties">
    <nav
      data-testid="subject"
      id={PROPERTY_FIXTURE.id}
      className={PROPERTY_FIXTURE.className}
      title={PROPERTY_FIXTURE.title}
      role={PROPERTY_FIXTURE.role}
      aria-label={PROPERTY_FIXTURE.ariaLabel}
      tabIndex={PROPERTY_FIXTURE.tabIndex}
    >
      content
    </nav>
  </FrontComponentCard>
);

export default defineFrontComponent({
  universalIdentifier: 'fc-nav-props-00000000-0000-0000-0000-000000000020',
  name: 'nav-properties-front-component',
  description: 'Front component covering property reflection on <nav>',
  component: NavPropertiesFrontComponent,
});
