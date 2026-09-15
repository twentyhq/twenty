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
  title: 'FrontComponent/HtmlTag/Form/Input/Clipboard',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const Paste: Story = runFrontComponentStory({
  frontComponentBundleName: 'input-clipboard',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.click(subject);
    await userEvent.paste('hello-clipboard');

    await expectEventLogged({
      canvas,
      matcher: { type: 'paste', clipboardText: 'hello-clipboard' },
    });
  },
});

export const CopyAndCutStayPrivate: Story = runFrontComponentStory({
  frontComponentBundleName: 'input-clipboard',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.click(subject);
    await userEvent.type(subject, 'secret');
    (subject as HTMLInputElement).select();

    await userEvent.copy();
    await expectEventLogged({
      canvas,
      matcher: { type: 'copy', clipboardText: undefined },
    });

    await userEvent.cut();
    await expectEventLogged({
      canvas,
      matcher: { type: 'cut', clipboardText: undefined },
    });
  },
});
