import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createRef } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IconUser } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

import { getChipLabel } from '@/ui/field/display/utils/getChipLabel';
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
const RECORD_NAME =
  'A long record name that requires an automatic overflow tooltip';

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

export const ApplicationLabels: Story = {
  render: () => {
    const namedLabel = getChipLabel(RECORD_NAME);
    const emptyLabel = getChipLabel('');

    return (
      <>
        <LinkChip to="/records/named" maxWidth={120} tooltipDelay={0}>
          {namedLabel.content}
        </LinkChip>
        <LinkChip to="/records/empty" aria-label={emptyLabel.text}>
          {emptyLabel.content}
        </LinkChip>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const user = userEvent.setup();
    const namedLink = canvas.getByRole('link', { name: RECORD_NAME });
    const namedLabel = within(namedLink).getByText(RECORD_NAME);
    const emptyLink = canvas.getByRole('link', { name: 'Untitled' });

    expect(emptyLink).toHaveTextContent('Untitled');
    expect(namedLabel.scrollWidth).toBeGreaterThan(namedLabel.clientWidth);
    await user.hover(namedLabel);
    expect(await body.findByRole('tooltip')).toHaveTextContent(RECORD_NAME);
    await user.unhover(namedLabel);
  },
};
