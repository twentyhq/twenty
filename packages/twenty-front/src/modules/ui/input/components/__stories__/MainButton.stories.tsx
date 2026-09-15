import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps, type FormEventHandler } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, fn, userEvent, within } from 'storybook/test';

import { MainButton } from '@/ui/input/components/MainButton';

type MainButtonStoryProps = ComponentProps<typeof MainButton> & {
  onSubmit?: FormEventHandler<HTMLFormElement>;
};

const meta: Meta<MainButtonStoryProps> = {
  title: 'UI/Input/MainButton',
  component: MainButton,
};

export default meta;
type Story = StoryObj<MainButtonStoryProps>;

export const FormControls: Story = {
  args: {
    onClick: fn(),
    onSubmit: fn<FormEventHandler<HTMLFormElement>>((event) =>
      event.preventDefault(),
    ),
  },
  render: (args) => (
    <form onSubmit={args.onSubmit}>
      <MainButton onClick={args.onClick}>Preview changes</MainButton>
      <MainButton type="submit" onClick={args.onClick}>
        Save changes
      </MainButton>
    </form>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const previewButton = canvas.getByRole('button', {
      name: 'Preview changes',
    });
    const previewButtonStyle = getComputedStyle(previewButton);

    await expect(previewButtonStyle.fontWeight).toBe('600');
    await expect(previewButtonStyle.paddingInlineStart).toBe('12px');
    await expect(previewButtonStyle.paddingInlineEnd).toBe('12px');
    await expect(previewButtonStyle.boxShadow).not.toBe('none');
    await expect(previewButton).toHaveAttribute('type', 'button');
    await userEvent.click(previewButton);
    await expect(args.onClick).toHaveBeenCalledOnce();
    await expect(args.onSubmit).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};

export const DisabledOutline: Story = {
  args: { onClick: fn() },
  render: (args) => (
    <MainButton
      variant="outline"
      elevated={false}
      disabled
      onClick={args.onClick}
    >
      Save changes
    </MainButton>
  ),
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Save changes',
    });

    await expect(button).toBeDisabled();
    await expect(getComputedStyle(button).boxShadow).toBe('none');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const RouterNavigation: Story = {
  render: () => (
    <MemoryRouter initialEntries={['/settings']}>
      <Routes>
        <Route
          path="/settings"
          element={
            <MainButton to="/settings/objects">Manage objects</MainButton>
          }
        />
        <Route path="/settings/objects" element={<p>Objects page</p>} />
      </Routes>
    </MemoryRouter>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Manage objects' });

    await expect(link).toHaveAttribute('href', '/settings/objects');
    await expect(link).not.toHaveAttribute('type');
    link.focus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('Objects page')).toBeVisible();
  },
};
