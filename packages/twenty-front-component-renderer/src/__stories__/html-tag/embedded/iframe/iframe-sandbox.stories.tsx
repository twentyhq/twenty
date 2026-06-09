import { type Meta } from '@storybook/react-vite';
import { within } from 'storybook/test';

import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { expectStorybookIframeSandboxSanitized } from '@/__stories__/shared/test-utils/matchers/expectStorybookIframeSandboxSanitized';
import { runFrontComponentStory } from '@/__stories__/shared/test-utils/runFrontComponentStory';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HtmlTag/Embedded/Iframe/Sandbox',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const Dangerous = runFrontComponentStory({
  frontComponentBundleName: 'iframe-sandbox-dangerous',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    await expectStorybookIframeSandboxSanitized({ canvas });
  },
});

export const Default = runFrontComponentStory({
  frontComponentBundleName: 'iframe-sandbox-default',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    await expectStorybookIframeSandboxSanitized({ canvas });
  },
});
