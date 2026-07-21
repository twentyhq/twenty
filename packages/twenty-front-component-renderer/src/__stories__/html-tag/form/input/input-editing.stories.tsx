import { type Meta, type StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';

import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectEventLogged } from '@/__stories__/shared/test-utils/matchers/expectEventLogged';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { runFrontComponentStory } from '@/__stories__/shared/test-utils/runFrontComponentStory';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HtmlTag/Form/Input/Editing',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const BeforeInputInsert: Story = runFrontComponentStory({
  frontComponentBundleName: 'input-editing',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.type(subject, 'a');

    await expectEventLogged({
      canvas,
      matcher: { type: 'beforeinput', inputType: 'insertText', data: 'a' },
    });
  },
});

export const BeforeInputDelete: Story = runFrontComponentStory({
  frontComponentBundleName: 'input-editing',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.type(subject, 'ab{backspace}');

    await expectEventLogged({
      canvas,
      matcher: { type: 'beforeinput', inputType: 'deleteContentBackward' },
    });
  },
});

export const Composition: Story = runFrontComponentStory({
  frontComponentBundleName: 'input-editing',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = await canvas.findByTestId('subject');

    subject.dispatchEvent(
      new CompositionEvent('compositionstart', { bubbles: true }),
    );
    subject.dispatchEvent(
      new CompositionEvent('compositionupdate', { data: 'か', bubbles: true }),
    );
    subject.dispatchEvent(
      new CompositionEvent('compositionend', { data: 'か', bubbles: true }),
    );

    await expectEventLogged({ canvas, matcher: { type: 'compositionstart' } });
    await expectEventLogged({
      canvas,
      matcher: { type: 'compositionupdate', data: 'か' },
    });
    await expectEventLogged({
      canvas,
      matcher: { type: 'compositionend', data: 'か' },
    });
  },
});
