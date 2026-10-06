import {
  FieldInputEventContext,
  type FieldInputEvent,
} from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useMultiSelectField } from '@/object-record/record-field/ui/meta-types/hooks/useMultiSelectField';
import { MultiSelectFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiSelectFieldInput';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button, Input } from 'twenty-ui/primitives/input';
import { FieldInputAnchorDecorator } from '~/testing/decorators/FieldInputAnchorDecorator';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';

type MultiSelectFieldInputExampleProps = {
  onSubmit: FieldInputEvent;
  onEnter: FieldInputEvent;
  onShiftTab: FieldInputEvent;
};

const MultiSelectFieldInputExample = ({
  onSubmit,
  onEnter,
  onShiftTab,
}: MultiSelectFieldInputExampleProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { setDraftValue } = useMultiSelectField();

  useEffect(() => {
    setDraftValue(['ON_SITE']);
  }, [setDraftValue]);

  return (
    <FieldInputEventContext.Provider
      value={{
        onSubmit: (args) => {
          onSubmit(args);
          setIsOpen(false);
        },
        onEnter: (args) => {
          onEnter(args);
          setIsOpen(false);
        },
        onShiftTab: (args) => {
          onShiftTab(args);
          setIsOpen(false);
        },
      }}
    >
      {isOpen && <MultiSelectFieldInput />}
      <Input aria-label="Outside input" />
      <Button>Outside picker</Button>
    </FieldInputEventContext.Provider>
  );
};

const meta: Meta<typeof MultiSelectFieldInputExample> = {
  title: 'UI/Data/Field/Input/MultiSelectFieldInput',
  component: MultiSelectFieldInputExample,
  decorators: [
    getFieldDecorator('company', 'workPolicy', ['ON_SITE']),
    ObjectMetadataItemsDecorator,
    MemoryRouterDecorator,
    FieldInputAnchorDecorator,
  ],
  args: { onSubmit: fn(), onEnter: fn(), onShiftTab: fn() },
};

export default meta;
type Story = StoryObj<typeof MultiSelectFieldInputExample>;

export const ToggleThenEscape: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const popup = await body.findByRole('dialog', { name: 'Work Policy' });
    const picker = within(popup);

    await userEvent.type(picker.getByRole('searchbox'), 'hybrid{Enter}');
    await waitFor(() => {
      expect(picker.getByRole('button', { name: 'Hybrid' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });
    expect(popup).toBeVisible();
    expect(args.onSubmit).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(args.onSubmit).toHaveBeenCalledWith({
        newValue: ['HYBRID', 'ON_SITE'],
      });
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};

export const EmptySearchEnter: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const popup = await body.findByRole('dialog', { name: 'Work Policy' });
    const picker = within(popup);

    await userEvent.click(picker.getByRole('button', { name: 'Hybrid' }));
    await userEvent.click(picker.getByRole('searchbox'));
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(args.onEnter).toHaveBeenCalledWith({
        newValue: ['HYBRID', 'ON_SITE'],
      });
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};

export const OutsideInputThenPress: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const popup = await body.findByRole('dialog', { name: 'Work Policy' });

    await userEvent.click(body.getByRole('textbox', { name: 'Outside input' }));
    expect(popup).toBeVisible();
    expect(args.onSubmit).not.toHaveBeenCalled();
    await userEvent.click(body.getByRole('button', { name: 'Outside picker' }));

    await waitFor(() => {
      expect(args.onSubmit).toHaveBeenCalledWith({ newValue: ['ON_SITE'] });
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};

export const ShiftTab: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('dialog', { name: 'Work Policy' });
    await userEvent.tab({ shift: true });

    await waitFor(() => {
      expect(args.onShiftTab).toHaveBeenCalledWith({ newValue: ['ON_SITE'] });
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};
