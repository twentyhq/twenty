import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { CampaignVariablePicker } from '@/activities/emails/components/CampaignVariablePicker';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';

const meta: Meta<typeof CampaignVariablePicker> = {
  title: 'Modules/Activities/Emails/CampaignVariablePicker',
  component: CampaignVariablePicker,
  decorators: [ComponentDecorator, ObjectMetadataItemsDecorator],
  args: {
    instanceId: 'campaign-variable-picker-story',
    onVariableSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CampaignVariablePicker>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Insert variable' }),
    );

    await userEvent.click(await body.findByText('Full name'));

    await waitFor(() => {
      expect(args.onVariableSelect).toHaveBeenCalledWith('{{fullName}}');
    });
  },
};
