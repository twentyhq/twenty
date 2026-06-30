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

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HtmlTag/Form/Select/Events',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const ValueRoundTrip: Story = runFrontComponentStory({
  frontComponentBundleName: 'select-value',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = (await canvas.findByTestId('subject')) as HTMLSelectElement;

    await userEvent.selectOptions(subject, 'beta');

    await expectFrontComponentValue({ canvas, expected: 'beta' });
    await expectEventLogged({
      canvas,
      matcher: { type: 'change', value: 'beta' },
    });

    await userEvent.selectOptions(subject, 'gamma');

    await expectFrontComponentValue({ canvas, expected: 'gamma' });
    await expectEventLogged({
      canvas,
      matcher: { type: 'change', value: 'gamma' },
    });
  },
});
