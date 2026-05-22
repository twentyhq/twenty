import { type Meta, type StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';

import { FrontComponentRenderer } from '../../../../host/components/FrontComponentRenderer';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '../../../shared/test-utils/createFrontComponentStoryMeta';
import { expectEventLogged } from '../../../shared/test-utils/matchers/expectEventLogged';
import { expectFrontComponentMounted } from '../../../shared/test-utils/matchers/expectFrontComponentMounted';
import { expectFrontComponentValue } from '../../../shared/test-utils/matchers/expectFrontComponentValue';
import { runFrontComponentStory } from '../../../shared/test-utils/runFrontComponentStory';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HTML/Form/Input/Checkbox',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const CheckedRoundTrip: Story = runFrontComponentStory({
  frontComponentBundleName: 'input',
  scenarioId: 'input:checkbox:checked',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.click(subject);

    await expectFrontComponentValue({ canvas, expected: 'true' });
    await expectEventLogged({
      canvas,
      matcher: { type: 'change', checked: true },
    });

    await userEvent.click(subject);

    await expectFrontComponentValue({ canvas, expected: 'false' });
    await expectEventLogged({
      canvas,
      matcher: { type: 'change', checked: false },
    });
  },
});
