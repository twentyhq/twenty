import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { createPropertyReflectionStory } from '../../test-utils/createPropertyReflectionStory';
import {
  PROBE_DEFAULT_ARGS,
  probeBeforeEach,
} from '../../test-utils/createProbeMeta';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/EventForwarding/PropertyReflection/Common',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: PROBE_DEFAULT_ARGS,
  beforeEach: probeBeforeEach,
};

export default meta;

export const Div = createPropertyReflectionStory({
  scenarioId: 'property:div',
});
export const Span = createPropertyReflectionStory({
  scenarioId: 'property:span',
});
export const Section = createPropertyReflectionStory({
  scenarioId: 'property:section',
});
export const Article = createPropertyReflectionStory({
  scenarioId: 'property:article',
});
export const P = createPropertyReflectionStory({ scenarioId: 'property:p' });
export const H1 = createPropertyReflectionStory({ scenarioId: 'property:h1' });
export const Nav = createPropertyReflectionStory({
  scenarioId: 'property:nav',
});
export const Aside = createPropertyReflectionStory({
  scenarioId: 'property:aside',
});
export const Button = createPropertyReflectionStory({
  scenarioId: 'property:button',
});
export const Label = createPropertyReflectionStory({
  scenarioId: 'property:label',
});
export const Fieldset = createPropertyReflectionStory({
  scenarioId: 'property:fieldset',
});
export const Details = createPropertyReflectionStory({
  scenarioId: 'property:details',
});
