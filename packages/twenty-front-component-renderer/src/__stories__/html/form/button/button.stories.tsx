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
  title: 'FrontComponent/HTML/Form/Button',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const ClickEvent: Story = runFrontComponentStory({
  frontComponentBundleName: 'button',
  scenarioId: 'button:click',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.click(subject);
    await expectFrontComponentValue({ canvas, expected: '1' });

    await userEvent.click(subject);
    await expectFrontComponentValue({ canvas, expected: '2' });

    await expectEventLogged({ canvas, matcher: { type: 'click' } });
  },
});
