import { defineFrontComponent } from 'twenty-sdk/define';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

const DivCrossingAttributesFrontComponent = () => (
  <FrontComponentCard title="div:crossing-attributes">
    <div
      data-testid="subject"
      role="option"
      aria-selected="true"
      aria-activedescendant="item-2"
      data-state="open"
      data-count="3"
      draggable={true}
    >
      content
    </div>
    <a data-testid="danger-link" href="javascript:alert(1)">
      danger
    </a>
  </FrontComponentCard>
);

export default defineFrontComponent({
  universalIdentifier: 'fc-div-cross-00000000-0000-0000-0000-000000000021',
  name: 'div-crossing-attributes-front-component',
  description:
    'Front component proving arbitrary aria-*/data-*/draggable attributes cross to the host DOM while dangerous URLs stay filtered',
  component: DivCrossingAttributesFrontComponent,
});
