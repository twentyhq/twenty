import { RecordIndexEmptyStateDisplay } from '@/object-record/record-index/components/RecordIndexEmptyStateDisplay';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IconFilterOff, IconPlus, IconSettings } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';

const onButtonClick = fn();

const meta: Meta<typeof RecordIndexEmptyStateDisplay> = {
  title: 'Modules/ObjectRecord/RecordIndex/RecordIndexEmptyStateDisplay',
  component: RecordIndexEmptyStateDisplay,
  decorators: [ComponentDecorator],
  args: {
    onButtonClick,
  },
};

export default meta;
type Story = StoryObj<typeof RecordIndexEmptyStateDisplay>;

const playRenderAndClick: Story['play'] = async ({ args, canvasElement }) => {
  onButtonClick.mockClear();

  const canvas = within(canvasElement);

  expect(await canvas.findByText(args.title as string)).toBeVisible();
  expect(canvas.getByText(args.subTitle as string)).toBeVisible();

  // The button renders a clipped ellipsis next to its title, so its
  // accessible name is not the bare title.
  const button = canvas.getByText(args.buttonTitle as string).closest('button');

  expect(button).not.toBeNull();

  await userEvent.click(button as HTMLElement);

  expect(onButtonClick).toHaveBeenCalledTimes(1);
};

export const NoRecordAtAll: Story = {
  args: {
    animatedPlaceholderType: 'noRecord',
    title: 'Add your first Person',
    subTitle: 'Use our API or add your first Person manually',
    ButtonIcon: IconPlus,
    buttonTitle: 'Add a Person',
  },
  play: playRenderAndClick,
};

export const NoRecordFoundForFilter: Story = {
  args: {
    animatedPlaceholderType: 'noMatchRecord',
    title: 'No Person found',
    subTitle: 'No records matching the filter criteria were found.',
    ButtonIcon: IconPlus,
    buttonTitle: 'Add a Person',
  },
  play: playRenderAndClick,
};

export const Remote: Story = {
  args: {
    animatedPlaceholderType: 'noRecord',
    title: 'No Data Available for Remote Table',
    subTitle: 'If this is unexpected, please verify your settings.',
    ButtonIcon: IconSettings,
    buttonTitle: 'Go to Settings',
  },
  play: playRenderAndClick,
};

export const SoftDelete: Story = {
  args: {
    animatedPlaceholderType: 'noDeletedRecord',
    title: 'No Deleted Person found',
    subTitle: 'No deleted records matching the filter criteria were found.',
    ButtonIcon: IconFilterOff,
    buttonTitle: 'Remove Deleted filter',
  },
  play: playRenderAndClick,
};
