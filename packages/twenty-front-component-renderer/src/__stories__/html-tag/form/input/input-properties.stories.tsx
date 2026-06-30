import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import { PROPERTY_FIXTURE } from '@/__stories__/shared/front-components/property-fixture';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { createPropertyReflectionStory } from '@/__stories__/shared/test-utils/createPropertyReflectionStory';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HtmlTag/Form/Input/Properties',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const Text = createPropertyReflectionStory({
  frontComponentBundleName: 'input-text-properties',
  extraAttributes: {
    type: PROPERTY_FIXTURE.type,
    name: PROPERTY_FIXTURE.name,
    placeholder: PROPERTY_FIXTURE.placeholder,
  },
  extraProperties: { value: PROPERTY_FIXTURE.textValue },
});

export const Number = createPropertyReflectionStory({
  frontComponentBundleName: 'input-number-properties',
  extraAttributes: {
    type: 'number',
    name: PROPERTY_FIXTURE.name,
  },
  extraProperties: { value: String(PROPERTY_FIXTURE.numberValue) },
});
