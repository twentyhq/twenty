import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

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
  title: 'FrontComponent/HtmlTag/Form/Input/Keyboard',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const BasicKey: Story = runFrontComponentStory({
  frontComponentBundleName: 'input-keyboard',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.click(subject);
    await userEvent.keyboard('a');

    await expectEventLogged({
      canvas,
      matcher: { type: 'keydown', key: 'a', code: 'KeyA' },
    });
    await expectEventLogged({
      canvas,
      matcher: { type: 'keyup', key: 'a', code: 'KeyA' },
    });
  },
});

export const ShiftModifier: Story = runFrontComponentStory({
  frontComponentBundleName: 'input-keyboard',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.click(subject);
    await userEvent.keyboard('{Shift>}b{/Shift}');

    await expectEventLogged({
      canvas,
      matcher: { type: 'keydown', shiftKey: true },
    });
  },
});

const playEnterReadsAndClearsUncontrolledValue: NonNullable<
  Story['play']
> = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  await expectFrontComponentMounted(canvas);

  const subject = await canvas.findByTestId('subject');

  await userEvent.type(subject, 'hi{Enter}', { delay: TYPING_DELAY });
  await expectFrontComponentValue({ canvas, expected: 'hi' });
  await waitFor(() => expect(subject).toHaveValue(''));

  await userEvent.type(subject, 'ab{Enter}', { delay: TYPING_DELAY });
  await expectFrontComponentValue({ canvas, expected: 'hi,ab' });
  await waitFor(() => expect(subject).toHaveValue(''));
};

export const EnterReadsAndClearsUncontrolledValue: Story =
  runFrontComponentStory({
    frontComponentBundleName: 'input-keydown-only',
    play: playEnterReadsAndClearsUncontrolledValue,
  });

export const EnterReadsAndClearsUncontrolledValuePreact: Story =
  runFrontComponentStory({
    frontComponentBundleName: 'input-keydown-only',
    runtime: 'preact',
    play: playEnterReadsAndClearsUncontrolledValue,
  });
