import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import {
  errorHandler,
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Worker Platform APIs',
  component: FrontComponentRenderer,
  parameters: {
    layout: 'centered',
  },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;
type Story = StoryObj<typeof FrontComponentRenderer>;

// KNOWN ISSUE (TDD) golden test: @remote-dom/polyfill ships MutationObserver
// as an empty class, so observe() throws and crashes the fixture at mount.
// When a real worker-local MutationObserver lands, flip this play to the
// behavior assertions below: click mutation-observer-add, then expect the
// data-observed count on mutation-observer-count to become greater than 0 and
// errorHandler not to have been called — a no-op stub cannot pass that.
const mutationObserverTest: Story['play'] = async () => {
  // Matching the message keeps an unrelated worker failure (bundle load,
  // import error, ...) from being cataloged as the MutationObserver gap.
  await waitFor(
    () => {
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('observe is not a function'),
        }),
      );
    },
    { timeout: 30000 },
  );
};

const createStory = (name: string, runtime?: 'preact'): Story => ({
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      `${name}.front-component`,
      runtime,
    ),
  },
  play: mutationObserverTest,
});

export const MutationObserverReact: Story = createStory(
  'mutation-observer-example',
);
export const MutationObserverPreact: Story = createStory(
  'mutation-observer-example',
  'preact',
);
