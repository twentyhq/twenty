import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { expect, fn, userEvent, within } from 'storybook/test';

import { NavigationButton } from '@/ui/input/components/NavigationButton';

const meta: Meta<typeof NavigationButton> = {
  title: 'UI/Input/NavigationButton',
  component: NavigationButton,
};

export default meta;
type Story = StoryObj<typeof NavigationButton>;

const CurrentLocation = () => {
  const { pathname, search, hash } = useLocation();

  return (
    <p>
      <output aria-label="Current location">
        {pathname}
        {search}
        {hash}
      </output>
    </p>
  );
};

export const RouterNavigation: Story = {
  args: { onClick: fn() },
  render: (args) => (
    <MemoryRouter initialEntries={['/settings/objects/companies']}>
      <Routes>
        <Route
          path="/settings/objects/:objectName/*"
          element={
            <>
              <NavigationButton to="./new-field/select" onClick={args.onClick}>
                Add field
              </NavigationButton>
              <NavigationButton
                to={{
                  pathname: '/settings/usage',
                  search: '?period=week',
                  hash: '#credits',
                }}
                onClick={args.onClick}
              >
                View usage
              </NavigationButton>
            </>
          }
        />
        <Route path="/settings/usage" element={<p>Usage page</p>} />
      </Routes>
      <CurrentLocation />
    </MemoryRouter>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const currentLocation = canvas.getByRole('status', {
      name: 'Current location',
    });
    const addFieldLink = canvas.getByRole('link', { name: 'Add field' });

    await expect(addFieldLink).toHaveAttribute(
      'href',
      '/settings/objects/companies/new-field/select',
    );
    addFieldLink.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledOnce();
    await expect(currentLocation.textContent).toBe(
      '/settings/objects/companies/new-field/select',
    );

    await userEvent.click(canvas.getByRole('link', { name: 'View usage' }));
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await expect(currentLocation.textContent).toBe(
      '/settings/usage?period=week#credits',
    );
    await expect(canvas.getByText('Usage page')).toBeVisible();
  },
};

export const Disabled: Story = {
  args: { disabled: true, onClick: fn() },
  render: (args) => (
    <MemoryRouter initialEntries={['/settings']}>
      <NavigationButton
        to="/settings/usage"
        disabled={args.disabled}
        onClick={args.onClick}
      >
        View usage
      </NavigationButton>
      <CurrentLocation />
    </MemoryRouter>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'View usage' });

    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(link);
    link.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(
      canvas.getByRole('status', { name: 'Current location' }).textContent,
    ).toBe('/settings');
  },
};

export const NativeButton: Story = {
  args: { onClick: fn() },
  render: (args) => (
    <NavigationButton onClick={args.onClick}>Save changes</NavigationButton>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Save changes' });

    await expect(button).not.toHaveAttribute('href');
    button.focus();
    await userEvent.keyboard('{Enter} ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};
