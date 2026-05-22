import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { PROPERTY_FIXTURE } from '../../example-sources/shared/property-fixture';
import { createPropertyReflectionStory } from '../../test-utils/createPropertyReflectionStory';
import {
  PROBE_DEFAULT_ARGS,
  probeBeforeEach,
} from '../../test-utils/createProbeMeta';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/EventForwarding/PropertyReflection/Media',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: PROBE_DEFAULT_ARGS,
  beforeEach: probeBeforeEach,
};

export default meta;

export const Anchor = createPropertyReflectionStory({
  scenarioId: 'property:a',
  extraAttributes: { href: PROPERTY_FIXTURE.href },
});

export const Img = createPropertyReflectionStory({
  scenarioId: 'property:img',
  extraAttributes: { src: PROPERTY_FIXTURE.src, alt: PROPERTY_FIXTURE.alt },
});

export const Progress = createPropertyReflectionStory({
  scenarioId: 'property:progress',
  extraAttributes: { value: '30', max: String(PROPERTY_FIXTURE.max) },
});

export const Meter = createPropertyReflectionStory({
  scenarioId: 'property:meter',
  extraAttributes: { value: '0.5', min: '0', max: '1' },
});
