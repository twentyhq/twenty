import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../../host/components/FrontComponentRenderer';
import { PROPERTY_FIXTURE } from '../../../shared/front-components/property-fixture';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '../../../shared/test-utils/createFrontComponentStoryMeta';
import { createPropertyReflectionStory } from '../../../shared/test-utils/createPropertyReflectionStory';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HtmlTag/Form/Select/Properties',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const Properties = createPropertyReflectionStory({
  frontComponentBundleName: 'select',
  scenarioId: 'select:properties',
  extraAttributes: { name: PROPERTY_FIXTURE.name },
  extraProperties: { value: 'alpha' },
});
