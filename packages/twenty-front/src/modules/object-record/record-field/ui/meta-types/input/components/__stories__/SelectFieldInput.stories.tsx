import {
  FieldInputEventContext,
  type FieldInputEvent,
} from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { SelectFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/SelectFieldInput';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button, Input } from 'twenty-ui/primitives/input';
import { FieldInputAnchorDecorator } from '~/testing/decorators/FieldInputAnchorDecorator';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';

type SelectFieldInputExampleProps = {
  onSubmit: FieldInputEvent;
  onCancel: () => void;
  onTab: FieldInputEvent;
  inline?: boolean;
  scale?: number;
};

const SelectFieldInputExample = ({
  onSubmit,
  onCancel,
  onTab,
  inline = false,
  scale = 1,
}: SelectFieldInputExampleProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const picker = isOpen ? <SelectFieldInput /> : null;

  return (
    <FieldInputEventContext.Provider
      value={{
        onSubmit: (args) => {
          onSubmit(args);
          setIsOpen(false);
        },
        onCancel: () => {
          onCancel();
          setIsOpen(false);
        },
        onTab: (args) => {
          onTab(args);
          setIsOpen(false);
        },
      }}
    >
      {inline ? (
        <div
          style={{ position: 'relative', width: 200, height: 80, zoom: scale }}
        >
          <RecordInlineCellEditMode>{picker}</RecordInlineCellEditMode>
        </div>
      ) : (
        picker
      )}
      <Input aria-label="Outside input" />
      <Button>Outside picker</Button>
    </FieldInputEventContext.Provider>
  );
};

const meta: Meta<typeof SelectFieldInputExample> = {
  title: 'UI/Data/Field/Input/SelectFieldInput',
  component: SelectFieldInputExample,
  decorators: [
    getFieldDecorator('task', 'status', 'TODO'),
    ObjectMetadataItemsDecorator,
    MemoryRouterDecorator,
    FieldInputAnchorDecorator,
  ],
  args: {
    onSubmit: fn(),
    onCancel: fn(),
    onTab: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SelectFieldInputExample>;

export const SearchThenEnter: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const popup = await body.findByRole('dialog', { name: 'Status' });
    const picker = within(popup);

    await userEvent.type(picker.getByRole('searchbox'), 'done');
    expect(
      picker.queryByRole('button', { name: 'No Status' }),
    ).not.toBeInTheDocument();
    expect(
      picker.queryByRole('button', { name: 'To do' }),
    ).not.toBeInTheDocument();
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(args.onSubmit).toHaveBeenCalledWith({ newValue: 'DONE' });
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(args.onCancel).not.toHaveBeenCalled();
  },
};

export const OutsideInputThenEscape: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const popup = await body.findByRole('dialog', { name: 'Status' });

    await userEvent.click(body.getByRole('textbox', { name: 'Outside input' }));
    expect(popup).toBeVisible();
    expect(args.onCancel).not.toHaveBeenCalled();
    await userEvent.click(within(popup).getByRole('searchbox'));
    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(args.onCancel).toHaveBeenCalledTimes(1);
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const OutsidePress: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('dialog', { name: 'Status' });
    await userEvent.click(body.getByRole('button', { name: 'Outside picker' }));

    await waitFor(() => {
      expect(args.onCancel).toHaveBeenCalledTimes(1);
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};

export const Tab: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('dialog', { name: 'Status' });
    await userEvent.tab();

    await waitFor(() => {
      expect(args.onTab).toHaveBeenCalledWith({ newValue: 'TODO' });
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};

export const InlineAnchor: Story = {
  args: { inline: true, scale: 1.25 },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const popup = await body.findByRole('dialog', { name: 'Status' });
    const anchor = within(canvasElement).getByTestId(
      'inline-cell-edit-mode-container',
    );

    await waitFor(() => {
      const anchorBounds = anchor.getBoundingClientRect();
      const popupBounds = popup.getBoundingClientRect();
      expect(
        Math.abs(popupBounds.top - (anchorBounds.bottom - 29 * 1.25)),
      ).toBeLessThan(2);
      expect(
        Math.abs(popupBounds.left - (anchorBounds.left - 5 * 1.25)),
      ).toBeLessThan(2);
    });
  },
};
