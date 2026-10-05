import { type Meta, type StoryObj } from '@storybook/react-vite';
import { styled } from '@linaria/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LightButton, MainButton } from 'twenty-ui/components';

import { NavigationButton } from '@/ui/input/components/NavigationButton';

const meta: Meta<typeof NavigationButton> = {
  title: 'UI/Input/NavigationButton',
  component: NavigationButton,
};

export default meta;
type Story = StoryObj<typeof NavigationButton>;

const StyledMainButton = styled(MainButton)`
  width: 200px;
`;

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
              <NavigationButton
                buttonComponent={MainButton}
                to="./new-field/select"
                onClick={args.onClick}
              >
                Add field
              </NavigationButton>
              <NavigationButton
                buttonComponent={LightButton}
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
    await expect(addFieldLink).not.toHaveAttribute('type');
    await expect(getComputedStyle(addFieldLink).fontWeight).toBe('600');
    addFieldLink.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledOnce();
    await expect(currentLocation.textContent).toBe(
      '/settings/objects/companies/new-field/select',
    );

    const usageLink = canvas.getByRole('link', { name: 'View usage' });
    await expect(usageLink).not.toHaveAttribute('type');
    await expect(getComputedStyle(usageLink).fontWeight).toBe('400');
    await userEvent.click(usageLink);
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
        buttonComponent={LightButton}
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

export const NativePreset: Story = {
  args: { onClick: fn() },
  render: (args) => (
    <NavigationButton
      buttonComponent={StyledMainButton}
      to={undefined}
      onClick={args.onClick}
    >
      Save changes
    </NavigationButton>
  ),
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Save changes',
    });

    await expect(button).toHaveAttribute('type', 'button');
    await expect(button).not.toHaveAttribute('href');
    await expect(button.getBoundingClientRect().width).toBe(200);
    await expect(getComputedStyle(button).fontWeight).toBe('600');
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
