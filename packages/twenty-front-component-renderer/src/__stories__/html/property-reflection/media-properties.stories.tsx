import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { PROPERTY_FIXTURE } from '../../shared/front-components/property-fixture';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '../../shared/test-utils/createFrontComponentStoryMeta';
import { createPropertyReflectionStory } from '../../shared/test-utils/createPropertyReflectionStory';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HTML/PropertyReflection/Media',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
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
