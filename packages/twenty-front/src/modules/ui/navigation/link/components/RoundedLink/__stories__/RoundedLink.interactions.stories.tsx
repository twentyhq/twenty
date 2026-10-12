import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type MouseEvent } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { RoundedLink } from '@/ui/navigation/link/components/RoundedLink/RoundedLink';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof RoundedLink> = {
  title: 'UI/Navigation/Link/RoundedLink/Interactions',
  component: RoundedLink,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof RoundedLink>;

const DESTINATIONS = [
  {
    label: 'Website',
    href: 'https://twenty.com',
    expected: 'https://twenty.com',
  },
  {
    label: 'Without scheme',
    href: 'twenty.com',
    expected: 'https://twenty.com',
  },
  { label: 'Settings', href: '/settings', expected: '/settings' },
  {
    label: 'Email',
    href: 'mailto:hello@twenty.com',
    expected: 'mailto:hello@twenty.com',
  },
  { label: 'Phone', href: 'tel:+33123456789', expected: 'tel:+33123456789' },
];

export const Destinations: Story = {
  render: () => (
    <>
      {DESTINATIONS.map(({ label, href }) => (
        <RoundedLink key={label} label={label} href={href} />
      ))}
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const { label, expected } of DESTINATIONS) {
      const link = canvas.getByRole('link', { name: label });

      await expect(link).toHaveAttribute('href', expected);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noreferrer');
    }
  },
};

export const MissingLabels: Story = {
  render: () => (
    <>
      <RoundedLink href="https://twenty.com" />
      <RoundedLink href="https://twenty.com" label="" />
      <RoundedLink href="https://twenty.com" label="Visible link" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('link')).toHaveLength(1);
    await expect(
      canvas.getByRole('link', { name: 'Visible link' }),
    ).toBeVisible();
  },
};

export const UnsafeDestination: Story = {
  args: {
    href: 'javascript:alert(1)',
    label: 'Unavailable destination',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Unavailable destination'),
    ).not.toHaveAttribute('href');
    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
  },
};

const handleParentClick = fn();
const handleLinkClick = fn((event: MouseEvent<HTMLElement>) => {
  expect(event.isPropagationStopped()).toBe(true);
  event.preventDefault();
});

export const ClickAndKeyboard: Story = {
  args: {
    href: 'https://twenty.com',
    label: 'Open website',
    className: 'caller-link',
    onClick: handleLinkClick,
  },
  render: (args) => (
    <div onClick={handleParentClick}>
      <RoundedLink {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Open website' });

    await expect(link).toHaveClass('caller-link');
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(handleLinkClick).toHaveBeenCalledTimes(1);
    await userEvent.click(link);
    await expect(handleLinkClick).toHaveBeenCalledTimes(2);
    await expect(handleParentClick).not.toHaveBeenCalled();
  },
};
