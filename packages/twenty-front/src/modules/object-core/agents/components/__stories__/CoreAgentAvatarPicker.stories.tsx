import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { CatalogDecorator } from 'twenty-ui/testing';

import { CoreAgentAvatarPickerExample } from '@/object-core/agents/components/__stories__/CoreAgentAvatarPickerExample';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const meta = {
  title: 'Modules/ObjectCore/Agents/CoreAgentAvatarPicker',
  component: CoreAgentAvatarPickerExample,
  decorators: [CatalogDecorator, IconsProviderDecorator, ToastDecorator],
  parameters: {
    catalog: { options: { elementContainer: { width: 320 } } },
  },
} satisfies Meta<typeof CoreAgentAvatarPickerExample>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SaveRapidChangesAndRecover: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', {
      name: 'Change avatar',
    });
    const readOnly = canvas.getByRole('group', { name: 'Read-only agent' });

    await expect(
      within(readOnly).queryByRole('button'),
    ).not.toBeInTheDocument();
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const red = await body.findByRole('option', { name: 'Red' });

    red.focus();
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('aria-busy', 'true');
    const flower = body.getByRole('option', { name: 'Flower' });

    flower.focus();
    await userEvent.keyboard('{Enter}');
    await expect(flower).toHaveAttribute('aria-selected', 'true');
    await body.findByText('Avatar update failed');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-busy', 'false'));
    await expect(body.getByRole('option', { name: 'Blue' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(flower).toHaveAttribute('aria-selected', 'true');

    const green = body.getByRole('option', { name: 'Green' });

    await userEvent.click(green);
    await expect(trigger).toHaveAttribute('aria-busy', 'true');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-busy', 'false'));
    await expect(green).toHaveAttribute('aria-selected', 'true');
    await expect(flower).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
