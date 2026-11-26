import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { RecordContextHarness } from '@/__stories__/shared/components/RecordContextHarness';
import {
  errorHandler,
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { MOUNT_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';

const meta: Meta<typeof RecordContextHarness> = {
  title: 'FrontComponent/Record Context',
  component: RecordContextHarness,
  args: {
    ...FRONT_COMPONENT_STORY_DEFAULT_ARGS,
    componentUrl: getBuiltStoryComponentPathForRender(
      'record-context.front-component',
    ),
  },
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;
type Story = StoryObj<typeof RecordContextHarness>;

export const UpdatesAndClearsSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'company: first-record',
        {},
        { timeout: MOUNT_TIMEOUT },
      ),
    ).toBeVisible();
    expect(canvas.getByText('Record: first-record')).toBeVisible();
    expect(canvas.getByText('Theme: light')).toBeVisible();
    expect(canvas.getByText('User: none')).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Switch record' }),
    );
    expect(await canvas.findByText('opportunity: second-record')).toBeVisible();
    expect(canvas.getByText('Record: second-record')).toBeVisible();
    expect(canvas.getByText('Theme: dark')).toBeVisible();
    expect(canvas.getByText('User: preview-user')).toBeVisible();
    expect(canvas.queryByText('company: first-record')).not.toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear selection' }),
    );
    expect(await canvas.findByText('No record selected')).toBeVisible();
    expect(canvas.getByText('Record: none')).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Unmount widget' }),
    );
    await waitFor(() =>
      expect(canvas.queryByText('No record selected')).not.toBeInTheDocument(),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Switch record' }),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Mount widget' }));
    expect(
      await canvas.findByText(
        'opportunity: second-record',
        {},
        { timeout: MOUNT_TIMEOUT },
      ),
    ).toBeVisible();
    expect(errorHandler).not.toHaveBeenCalled();
  },
};
