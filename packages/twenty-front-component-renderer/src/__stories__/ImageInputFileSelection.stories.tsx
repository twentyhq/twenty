import { createElement } from 'react';
import { ImageInputFileSelectionHarness } from '@/__stories__/shared/components/ImageInputFileSelectionHarness';

import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { imageInputFileSelectionTest } from '@/__stories__/shared/test-utils/imageInputFileSelectionTest';
import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/ImageInput file selection',
  component: FrontComponentRenderer,
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
  render: (args) => createElement(ImageInputFileSelectionHarness, args),
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const React: Story = {
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      'twenty-ui-image-input.front-component',
      'react',
    ),
  },
  play: imageInputFileSelectionTest,
};

export const Preact: Story = {
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      'twenty-ui-image-input.front-component',
      'preact',
    ),
  },
  play: imageInputFileSelectionTest,
};
