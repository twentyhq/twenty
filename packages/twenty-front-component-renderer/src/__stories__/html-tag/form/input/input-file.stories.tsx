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
  title: 'FrontComponent/HtmlTag/Form/Input/File',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const SingleFile: Story = runFrontComponentStory({
  frontComponentBundleName: 'input-file-single',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = (await canvas.findByTestId('subject')) as HTMLInputElement;

    const file = new File(['hello world'], 'hello.txt', {
      type: 'text/plain',
      lastModified: 1700000000000,
    });

    await userEvent.upload(subject, file);

    await expectEventLogged({
      canvas,
      matcher: {
        type: 'change',
        files: [{ name: 'hello.txt', type: 'text/plain' }],
      },
    });
  },
});

export const MultipleFiles: Story = runFrontComponentStory({
  frontComponentBundleName: 'input-file-multiple',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = (await canvas.findByTestId('subject')) as HTMLInputElement;

    const first = new File(['a'], 'one.png', { type: 'image/png' });
    const second = new File(['bb'], 'two.png', { type: 'image/png' });

    await userEvent.upload(subject, [first, second]);

    await expectEventLogged({
      canvas,
      matcher: {
        type: 'change',
        files: [
          { name: 'one.png', type: 'image/png' },
          { name: 'two.png', type: 'image/png' },
        ],
      },
    });
  },
});
