import { createElement } from 'react';
import { ImageInputFileSelectionHarness } from '@/__stories__/shared/components/ImageInputFileSelectionHarness';

import { type Meta } from '@storybook/react-vite';

import { FRONT_COMPONENT_STORY_DEFAULT_ARGS } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/ImageInput file selection',
  component: FrontComponentRenderer,
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  render: (args) => createElement(ImageInputFileSelectionHarness, args),
};

export default meta;

export const React = {
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      'twenty-ui-image-input.front-component',
      'react',
    ),
  },
};

export const Preact = {
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      'twenty-ui-image-input.front-component',
      'preact',
    ),
  },
};
