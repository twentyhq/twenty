import { EmailsCardContent } from '@/activities/emails/components/EmailsCardContent';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const onRetry = fn();
const onClearFilter = fn();

const meta: Meta<typeof EmailsCardContent> = {
  title: 'Modules/Activities/Emails/EmailsCardContent',
  component: EmailsCardContent,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 360 } },
  args: {
    firstQueryLoading: false,
    isFetchingMore: false,
    onLastRowVisible: fn(async () => undefined),
    onRetry,
    onClearFilter,
    timelineThreads: undefined,
  },
  beforeEach: () => {
    onRetry.mockClear();
    onClearFilter.mockClear();
  },
};

export default meta;
type Story = StoryObj<typeof EmailsCardContent>;

export const LoadError: Story = {
  args: { error: new Error('Network error') },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText("We couldn't load the messages"),
    ).toBeVisible();
    await expect(canvas.queryByText('No messages yet')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));

    await expect(onRetry).toHaveBeenCalledTimes(1);
  },
};

export const NoMatchingConversation: Story = {
  args: { isFiltered: true, timelineThreads: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText('No matching conversations'),
    ).toBeVisible();
    await expect(canvas.queryByText('No messages yet')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Clear filter' }));

    await expect(onClearFilter).toHaveBeenCalledTimes(1);
  },
};
