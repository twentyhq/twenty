import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { runFrontComponentStory } from '@/__stories__/shared/test-utils/runFrontComponentStory';
import { HOST_FORM_ASSOCIATION_TARGET_ID } from './host-form-association-target-id';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HtmlTag/Form/Input/Form association',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
  decorators: [
    (Story) => (
      <>
        <form
          id={HOST_FORM_ASSOCIATION_TARGET_ID}
          aria-label="Host preferences"
        >
          <input type="hidden" name="host-choice" value="host-value" />
        </form>
        <Story />
      </>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

const play: NonNullable<Story['play']> = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const hostForm = canvas.getByRole<HTMLFormElement>('form', {
    name: 'Host preferences',
  });
  const externalChoice = canvas.getByRole<HTMLInputElement>('checkbox', {
    name: 'External choice',
  });

  expect(externalChoice).not.toHaveAttribute('form');
  expect(externalChoice.form).toBeNull();
  expect(hostForm.checkValidity()).toBe(true);
  expect(new FormData(hostForm).get('host-choice')).toBe('host-value');

  await userEvent.click(externalChoice);
  await waitFor(() => expect(externalChoice).toBeChecked());
  expect(new FormData(hostForm).has('guest-choice')).toBe(false);

  await userEvent.click(
    canvas.getByRole('button', { name: 'Send uppercase form owner' }),
  );
  await waitFor(() =>
    expect(canvas.getByText('Attempt: FORM requested')).toBeVisible(),
  );
  expect(externalChoice).not.toHaveAttribute('form');
  expect(externalChoice.form).toBeNull();
  expect(new FormData(hostForm).has('guest-choice')).toBe(false);

  await userEvent.click(
    canvas.getByRole('button', { name: 'Send lowercase form owner' }),
  );
  await waitFor(() =>
    expect(canvas.getByText('Attempt: form requested')).toBeVisible(),
  );
  expect(externalChoice).not.toHaveAttribute('form');
  expect(externalChoice.form).toBeNull();
  expect(new FormData(hostForm).has('guest-choice')).toBe(false);

  const guestForm = canvas.getByRole<HTMLFormElement>('form', {
    name: 'Guest preferences',
  });
  const descendantChoice = canvas.getByRole<HTMLInputElement>('checkbox', {
    name: 'Descendant choice',
  });
  expect(descendantChoice.form).toBe(guestForm);
  expect(guestForm.checkValidity()).toBe(false);
  await userEvent.click(descendantChoice);
  await waitFor(() => expect(descendantChoice).toBeChecked());
  expect(guestForm.checkValidity()).toBe(true);
  expect(new FormData(guestForm).get('descendant-choice')).toBe(
    'descendant-value',
  );
  expect(new FormData(hostForm).has('descendant-choice')).toBe(false);
};

export const React: Story = runFrontComponentStory({
  frontComponentBundleName: 'input-form-association',
  play,
});

export const Preact: Story = runFrontComponentStory({
  frontComponentBundleName: 'input-form-association',
  runtime: 'preact',
  play,
});
