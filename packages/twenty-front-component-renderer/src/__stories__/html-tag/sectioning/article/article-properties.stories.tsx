import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../../host/components/FrontComponentRenderer';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '../../../shared/test-utils/createFrontComponentStoryMeta';
import { createPropertyReflectionStory } from '../../../shared/test-utils/createPropertyReflectionStory';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HtmlTag/Sectioning/Article/Properties',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const Properties = createPropertyReflectionStory({
  frontComponentBundleName: 'article',
  scenarioId: 'article:properties',
});
