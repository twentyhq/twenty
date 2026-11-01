import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ImageInputFileSelectionHarness } from '@/__stories__/shared/components/ImageInputFileSelectionHarness';
import { FRONT_COMPONENT_STORY_DEFAULT_ARGS } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';

const meta: Meta<typeof ImageInputFileSelectionHarness> = {
  title: 'FrontComponent/ImageInput file selection',
  component: ImageInputFileSelectionHarness,
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  tags: ['!test'],
};

export default meta;

type Story = StoryObj<typeof ImageInputFileSelectionHarness>;

export const React: Story = {
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      'twenty-ui-image-input.front-component',
      'react',
    ),
  },
};

export const Preact: Story = {
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      'twenty-ui-image-input.front-component',
      'preact',
    ),
  },
};
