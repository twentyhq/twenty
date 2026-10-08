import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createRef } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IconUser } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

import { LinkChip } from '@/ui/navigation/link/components/LinkChip/LinkChip';

const meta: Meta<typeof LinkChip> = {
  title: 'UI/Data Display/LinkChip/Interactions',
  component: LinkChip,
  decorators: [
    ComponentDecorator,
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LinkChip>;

const onParentClick = fn();
const linkRef = createRef<HTMLAnchorElement>();

export const NativeLink: Story = {
  args: {
    to: '/records/1',
    children: 'https://twenty.com',
    target: '_blank',
    onClick: fn(),
  },
  beforeEach: () => onParentClick.mockClear(),
  render: (args) => (
    <>
      <Button>Before link</Button>
      <div onClick={onParentClick}>
        <LinkChip {...args} ref={linkRef} />
      </div>
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const link = canvas.getByRole('link', { name: 'https://twenty.com' });

    expect(linkRef.current).toBe(link);
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/records/1');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.querySelector('a')).toBeNull();
    await user.click(canvas.getByRole('button', { name: 'Before link' }));
    await user.tab();
    expect(link).toHaveFocus();
    expect(getComputedStyle(link).outlineStyle).toBe('solid');
    await user.keyboard('{Enter}');
    expect(args.onClick).toHaveBeenCalledTimes(1);
    await user.click(link);
    expect(args.onClick).toHaveBeenCalledTimes(2);
    expect(onParentClick).not.toHaveBeenCalled();
  },
};

export const NamedIconOnlyLink: Story = {
  args: {
    to: '/records/1',
    'aria-label': 'Open record',
    startElement: <IconUser size={14} aria-hidden />,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const link = canvas.getByRole('link', { name: 'Open record' });

    expect(link).toHaveTextContent('');
    expect(canvas.queryByText('Untitled')).not.toBeInTheDocument();
    await user.tab();
    expect(link).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
