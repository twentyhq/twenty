import { WidgetPlaceholder } from '@/page-layout/widgets/components/WidgetPlaceholder';
import { type Meta, type StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof WidgetPlaceholder> = {
  title: 'Modules/PageLayout/Widgets/WidgetPlaceholder',
  component: WidgetPlaceholder,
  decorators: [ComponentDecorator],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A placeholder widget that appears when no widgets are present. Shows an empty state with a call-to-action to add the first widget.',
      },
    },
  },
  argTypes: {
    onClick: {
      action: 'onClick',
      description:
        'Callback function triggered when the placeholder is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof WidgetPlaceholder>;

export const Default: Story = {
  args: {
    onClick: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Default widget placeholder state.',
      },
    },
  },
};
