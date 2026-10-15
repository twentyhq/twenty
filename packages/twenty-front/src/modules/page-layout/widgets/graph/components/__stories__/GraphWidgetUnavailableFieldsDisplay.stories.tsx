import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { GraphWidgetUnavailableFieldsDisplay } from '@/page-layout/widgets/graph/components/GraphWidgetUnavailableFieldsDisplay';

const meta: Meta<typeof GraphWidgetUnavailableFieldsDisplay> = {
  title: 'Modules/PageLayout/Widgets/GraphWidgetUnavailableFieldsDisplay',
  component: GraphWidgetUnavailableFieldsDisplay,
  decorators: [ComponentDecorator],
  parameters: {
    layout: 'centered',
  },
  args: {
    widgetId: 'widget-id',
  },
};

export default meta;
type Story = StoryObj<typeof GraphWidgetUnavailableFieldsDisplay>;

export const DeactivatedField: Story = {
  args: {
    unavailableFields: [
      {
        fieldMetadataId: 'amount-id',
        fieldMetadataItem: {
          id: 'amount-id',
          label: 'Amount',
          isActive: false,
        },
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.hover(await canvas.findByText('Invalid Configuration'));

    await expect(await body.findByRole('tooltip')).toHaveTextContent(
      'This chart uses a field that is no longer active: "Amount". Edit the widget to choose another field.',
    );
  },
};

export const DeactivatedAndDeletedFields: Story = {
  args: {
    unavailableFields: [
      {
        fieldMetadataId: 'amount-id',
        fieldMetadataItem: {
          id: 'amount-id',
          label: 'Amount',
          isActive: false,
        },
      },
      { fieldMetadataId: 'region-id' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.hover(await canvas.findByText('Invalid Configuration'));

    await expect(await body.findByRole('tooltip')).toHaveTextContent(
      'This chart uses fields that are no longer active: "Amount", deleted field. Edit the widget to choose other fields.',
    );
  },
};
