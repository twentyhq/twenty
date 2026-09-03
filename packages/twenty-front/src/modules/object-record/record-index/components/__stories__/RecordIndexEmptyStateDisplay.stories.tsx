import { RecordIndexEmptyStateDisplay } from '@/object-record/record-index/components/RecordIndexEmptyStateDisplay';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconFilterOff, IconPlus, IconSettings } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof RecordIndexEmptyStateDisplay> = {
  title: 'Modules/ObjectRecord/RecordIndex/RecordIndexEmptyStateDisplay',
  component: RecordIndexEmptyStateDisplay,
  decorators: [ComponentDecorator],
  args: {
    onButtonClick: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof RecordIndexEmptyStateDisplay>;

export const NoRecordAtAll: Story = {
  args: {
    animatedPlaceholderType: 'noRecord',
    title: 'Add your first Person',
    subTitle: 'Use our API or add your first Person manually',
    ButtonIcon: IconPlus,
    buttonTitle: 'Add a Person',
  },
};

export const NoRecordFoundForFilter: Story = {
  args: {
    animatedPlaceholderType: 'noMatchRecord',
    title: 'No Person found',
    subTitle: 'No records matching the filter criteria were found.',
    ButtonIcon: IconPlus,
    buttonTitle: 'Add a Person',
  },
};

export const Remote: Story = {
  args: {
    animatedPlaceholderType: 'noRecord',
    title: 'No Data Available for Remote Table',
    subTitle: 'If this is unexpected, please verify your settings.',
    ButtonIcon: IconSettings,
    buttonTitle: 'Go to Settings',
  },
};

export const SoftDelete: Story = {
  args: {
    animatedPlaceholderType: 'noDeletedRecord',
    title: 'No Deleted Person found',
    subTitle: 'No deleted records matching the filter criteria were found.',
    ButtonIcon: IconFilterOff,
    buttonTitle: 'Remove Deleted filter',
  },
};
