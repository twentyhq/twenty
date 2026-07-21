import { type Meta } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { expectAttributesReflected } from '@/__stories__/shared/test-utils/matchers/expectPropertyReflected';
import { runFrontComponentStory } from '@/__stories__/shared/test-utils/runFrontComponentStory';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HtmlTag/Grouping/Div/CrossingAttributes',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const CrossingAttributes = runFrontComponentStory({
  frontComponentBundleName: 'div-crossing-attributes',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    await expectAttributesReflected({
      canvas,
      attributes: {
        role: 'option',
        'aria-selected': 'true',
        'aria-activedescendant': 'item-2',
        'data-state': 'open',
        'data-count': '3',
        draggable: 'true',
      },
    });

    await waitFor(() => {
      const dangerLink = canvas.queryByTestId('danger-link');

      expect(dangerLink).not.toBeNull();
      expect(dangerLink?.getAttribute('href')).toBeNull();
    });
  },
});
