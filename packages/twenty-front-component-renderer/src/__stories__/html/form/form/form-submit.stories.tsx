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
  title: 'FrontComponent/HTML/Form/Form/Submit',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const SubmitEvent: Story = runFrontComponentStory({
  frontComponentBundleName: 'form',
  scenarioId: 'form:submit',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const submitButton = await canvas.findByTestId('submit-button');

    await userEvent.click(submitButton);

    await expectFrontComponentValue({ canvas, expected: 'value-from-form' });
    await expectEventLogged({ canvas, matcher: { type: 'submit' } });
  },
});
