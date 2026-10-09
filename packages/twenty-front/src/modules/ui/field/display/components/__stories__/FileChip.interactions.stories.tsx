import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type FormEvent } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { FILE_CATEGORIES } from 'twenty-shared/types';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

import { FileChip } from '@/ui/field/display/components/FileChip';

const meta: Meta<typeof FileChip> = {
  title: 'UI/Field/Display/FileChip/Interactions',
  component: FileChip,
  decorators: [ComponentDecorator],
  args: {
    file: {
      fileId: 'contract-file-id',
      label: 'Contract.pdf',
      extension: 'pdf',
      fileCategory: FILE_CATEGORIES.TEXT_DOCUMENT,
      url: 'https://example.com/contract.pdf',
    },
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof FileChip>;

const onParentClick = fn();
const onFormSubmit = fn((event: FormEvent) => event.preventDefault());

export const NativePreviewButton: Story = {
  beforeEach: () => {
    onParentClick.mockClear();
    onFormSubmit.mockClear();
  },
  render: (args) => (
    <>
      <Button>Before file</Button>
      <form onClick={onParentClick} onSubmit={onFormSubmit}>
        <FileChip {...args} />
      </form>
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const button = canvas.getByRole('button', { name: 'Contract.pdf' });

    expect(button).toHaveAttribute('type', 'button');
    await user.click(canvas.getByRole('button', { name: 'Before file' }));
    await user.tab();
    expect(button).toHaveFocus();
    expect(getComputedStyle(button).outlineStyle).toBe('solid');
    await user.keyboard('{Enter} ');
    expect(args.onClick).toHaveBeenCalledTimes(2);
    await user.click(button);
    expect(args.onClick).toHaveBeenCalledTimes(3);
    expect(onParentClick).not.toHaveBeenCalled();
    expect(onFormSubmit).not.toHaveBeenCalled();
  },
};

export const DeletedFileIsDisabled: Story = {
  args: {
    file: {
      fileId: 'deleted-file-id',
      label: 'Deleted contract.pdf',
      extension: 'pdf',
      fileCategory: FILE_CATEGORIES.TEXT_DOCUMENT,
      url: 'https://example.com/contract.pdf',
      isDeleted: true,
    },
  },
  render: (args) => (
    <>
      <Button>Before deleted file</Button>
      <FileChip {...args} />
      <Button>After deleted file</Button>
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const button = canvas.getByRole('button', { name: 'Deleted contract.pdf' });

    expect(button).toBeDisabled();
    await user.click(
      canvas.getByRole('button', { name: 'Before deleted file' }),
    );
    await user.tab();
    expect(
      canvas.getByRole('button', { name: 'After deleted file' }),
    ).toHaveFocus();
    await user.click(button);
    expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const PresentationalFile: Story = {
  args: { forceDisableClick: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await user.click(canvas.getByText('Contract.pdf'));
    expect(args.onClick).not.toHaveBeenCalled();
  },
};
