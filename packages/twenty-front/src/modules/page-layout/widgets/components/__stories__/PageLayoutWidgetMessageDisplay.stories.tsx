import { PageLayoutWidgetMessageDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetMessageDisplay';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconFileText, IconVideo } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof PageLayoutWidgetMessageDisplay> = {
  title: 'Modules/PageLayout/Widgets/PageLayoutWidgetMessageDisplay',
  component: PageLayoutWidgetMessageDisplay,
  decorators: [ComponentDecorator],
  parameters: {
    layout: 'centered',
    container: { width: 500 },
  },
};

export default meta;
type Story = StoryObj<typeof PageLayoutWidgetMessageDisplay>;

export const Default: Story = {
  args: {
    Icon: IconFileText,
    message: 'No call recording exists for this calendar event yet.',
  },
};

export const WithLongMessage: Story = {
  args: {
    Icon: IconVideo,
    message:
      'The transcript could not be generated because the recording ended before any participant spoke. Try recording the next occurrence of this event.',
  },
};
