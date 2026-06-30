import { type Meta, type StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';

import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectEventLogged } from '@/__stories__/shared/test-utils/matchers/expectEventLogged';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { expectFrontComponentValue } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentValue';
import { runFrontComponentStory } from '@/__stories__/shared/test-utils/runFrontComponentStory';
import { TYPING_DELAY } from '@/__stories__/shared/test-utils/timeouts';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HtmlTag/Form/Input/Events',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const TextValueRoundTrip: Story = runFrontComponentStory({
  frontComponentBundleName: 'input-text-value',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.type(subject, 'hello', { delay: TYPING_DELAY });

    await expectFrontComponentValue({ canvas, expected: 'hello' });
    await expectEventLogged({
      canvas,
      matcher: { type: 'change', value: 'hello' },
    });
  },
});

export const FocusBlurEvents: Story = runFrontComponentStory({
  frontComponentBundleName: 'input-text-focus-blur',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.click(subject);
    await expectEventLogged({ canvas, matcher: { type: 'focus' } });

    const blurTarget = await canvas.findByTestId('blur-target');

    await userEvent.click(blurTarget);
    await expectEventLogged({ canvas, matcher: { type: 'blur' } });
  },
});
