import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';

import { Select } from '@/ui/input/components/Select';
import { type SelectProps } from '@/ui/input/types/SelectProps';
import { IconPlus } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';

type RenderProps = SelectProps<string | number | boolean | null>;

const Render = (args: RenderProps) => {
  const [value, setValue] = useState(args.value);
  const handleChange = (value: string | number | boolean | null) => {
    args.onChange?.(value);
    setValue(value);
  };

  // oxlint-disable-next-line react/jsx-props-no-spreading
  return <Select {...args} value={value} onChange={handleChange} />;
};

const meta: Meta<typeof Select> = {
  title: 'UI/Input/Select',
  component: Select,
  decorators: [ComponentDecorator],
  args: {
    dropdownId: 'select',
    value: 'a',
    options: [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
      { value: 'c', label: 'Option C' },
    ],
  },
  render: Render,
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {};

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const selectLabel = await canvas.getByText('Option A');

    await userEvent.click(selectLabel);
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithSearch: Story = {
  args: { withSearchInput: true },
};

export const CallToActionButton: Story = {
  args: {
    callToActionButton: {
      onClick: () => {},
      Icon: IconPlus,
      text: 'Add action',
    },
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Test label',
  },
};

export const WithDescription: Story = {
  args: {
    description: 'Test description',
  },
};

export const WithNullOption: Story = {
  args: {
    options: [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
      { value: null, label: 'Option C' },
    ],
  },
};

export const FirstOptionWithoutValue: Story = {
  args: { value: undefined, onChange: fn(), onBlur: fn() },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Option A',
    });
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(trigger);
    const firstOption = await body.findByRole('option', {
      name: 'Option A',
      selected: false,
    });
    await userEvent.click(firstOption);
    expect(args.onChange).toHaveBeenCalledOnce();
    expect(args.onChange).toHaveBeenCalledWith('a');
    expect(args.onBlur).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    await userEvent.click(trigger);
    const selectedOption = await body.findByRole('option', {
      name: 'Option A',
      selected: true,
    });
    await waitFor(() => expect(selectedOption).toHaveFocus());
    await userEvent.keyboard('{Escape}');
  },
};

export const FirstOptionWithUnmatchedValue: Story = {
  args: { value: 'missing', onChange: fn(), onBlur: fn() },
  play: FirstOptionWithoutValue.play,
};

export const TypedOptionValues: Story = {
  args: {
    value: 1,
    onChange: fn(),
    options: [
      { value: 1, label: 'Number one' },
      { value: '1', label: 'String one' },
      { value: false, label: 'Boolean false' },
      { value: null, label: 'No value' },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button');
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(trigger);
    const numberOption = await body.findByRole('option', {
      name: 'Number one',
      selected: true,
    });
    await waitFor(() => expect(numberOption).toHaveFocus());
    expect(body.getByRole('option', { name: 'String one' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    await userEvent.click(body.getByRole('option', { name: 'String one' }));
    expect(args.onChange).toHaveBeenLastCalledWith('1');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('option', { name: 'Boolean false' }),
    );
    expect(args.onChange).toHaveBeenLastCalledWith(false);
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('option', { name: 'No value' }),
    );
    expect(args.onChange).toHaveBeenLastCalledWith(null);
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    await userEvent.click(trigger);
    const emptyOption = await body.findByRole('option', {
      name: 'No value',
      selected: true,
    });
    await waitFor(() => expect(emptyOption).toHaveFocus());
    await userEvent.keyboard('{Escape}');
  },
};

export const WithoutOptions: Story = {
  args: {
    options: [],
  },
};

export const SearchWithPinnedDisabledAndAction: Story = {
  args: {
    value: 'b',
    withSearchInput: true,
    needIconCheck: true,
    options: [
      { value: 'a', label: 'Éclair', searchKeywords: 'pastry' },
      { value: 'b', label: 'Option B', disabled: true },
      { value: 'c', label: 'Option C' },
    ],
    pinnedOption: { value: 'default', label: 'Use default' },
    onChange: fn(),
    callToActionButton: { text: 'Add option', onClick: fn(), Icon: IconPlus },
  },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button');
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog');
    const options = within(popup).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual([
      'Use default',
      'Éclair',
      'Option B',
      'Option C',
    ]);
    const disabled = within(popup).getByRole('option', { name: 'Option B' });
    expect(disabled).toBeDisabled();
    await userEvent.click(disabled);
    expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.click(
      within(popup).getByRole('button', { name: 'Add option' }),
    );
    expect(args.callToActionButton?.onClick).toHaveBeenCalledTimes(1);
    expect(popup).toBeVisible();
    const search = within(popup).getByRole('searchbox', { name: 'Search' });
    await userEvent.type(search, 'default');
    await waitFor(() =>
      expect(
        within(popup).getByRole('option', { name: 'Use default' }),
      ).toHaveAttribute('data-highlighted'),
    );
    await userEvent.clear(search);
    await userEvent.type(search, 'pastry');
    expect(
      within(popup).queryByRole('option', { name: 'Option C' }),
    ).not.toBeInTheDocument();
    expect(
      within(popup).queryByRole('option', { name: 'Use default' }),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        within(popup).getByRole('option', { name: 'Éclair' }),
      ).toHaveAttribute('data-highlighted'),
    );
    await userEvent.keyboard('{Enter}');
    expect(args.onChange).toHaveBeenCalledWith('a');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());

    await userEvent.click(trigger);
    const reopenedPopup = await body.findByRole('dialog');
    expect(
      within(reopenedPopup).getByRole('searchbox', { name: 'Search' }),
    ).toHaveValue('');
  },
};

export const KeyboardStartsAtSelection: Story = {
  args: { value: 'b', onChange: fn(), onBlur: fn() },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button');
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    const selected = await body.findByRole('option', {
      name: 'Option B',
      selected: true,
    });
    await waitFor(() => expect(selected).toHaveFocus());
    expect(args.onBlur).not.toHaveBeenCalled();
    await userEvent.keyboard('{ArrowDown}');
    expect(args.onBlur).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    expect(args.onBlur).toHaveBeenCalledTimes(1);
    expect(args.onChange).toHaveBeenCalledWith('c');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const SingleTabStopAndLabelledPopup: Story = {
  args: { label: 'Status' },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const body = within(canvasElement.ownerDocument.body);
    await expect(
      await body.findByRole('dialog', { name: 'Status' }),
    ).toBeVisible();
  },
};

export const DropdownWidthAutoMatchesTrigger: Story = {
  args: { fullWidth: true, dropdownWidthAuto: true },
  parameters: { container: { width: 500 } },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    const popup = await body.findByRole('dialog');
    await waitFor(() =>
      expect(popup.getBoundingClientRect().width).toBe(
        trigger.getBoundingClientRect().width,
      ),
    );
  },
};

const onParentClick = fn();
const onParentClickOutside = fn();
const onExcludedClickOutside = fn();
const PARENT_ID = 'select-parent';
const EXCLUDED_ID = 'select-excluded';

const ContainmentExample = ({ children }: { children: ReactNode }) => {
  useListenClickOutside({
    refs: [],
    listenerId: 'select-parent-listener',
    excludedClickOutsideIds: [PARENT_ID],
    callback: onParentClickOutside,
  });
  useListenClickOutside({
    refs: [],
    listenerId: 'select-excluded-listener',
    excludedClickOutsideIds: [EXCLUDED_ID],
    callback: onExcludedClickOutside,
  });
  return (
    <>
      <ParentClickOutsideIdContext.Provider value={PARENT_ID}>
        <ClickOutsideListenerContext.Provider
          value={{ excludedClickOutsideId: EXCLUDED_ID }}
        >
          <div data-click-outside-id={EXCLUDED_ID}>
            <div data-click-outside-id={PARENT_ID} onClick={onParentClick}>
              {children}
            </div>
          </div>
        </ClickOutsideListenerContext.Provider>
      </ParentClickOutsideIdContext.Provider>
      <Button>Outside</Button>
    </>
  );
};

export const ParentAndClickOutsideContainment: Story = {
  decorators: [
    (Story) => (
      <ContainmentExample>
        <Story />
      </ContainmentExample>
    ),
  ],
  beforeEach: () => {
    onParentClick.mockClear();
    onParentClickOutside.mockClear();
    onExcludedClickOutside.mockClear();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Option A' });
    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('option', { name: 'Option B' }),
    );
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(onParentClick).not.toHaveBeenCalled();
    expect(onParentClickOutside).not.toHaveBeenCalled();
    expect(onExcludedClickOutside).not.toHaveBeenCalled();
    await userEvent.click(trigger);
    await body.findByRole('dialog');
    const outsideButton = canvas.getByRole('button', { name: 'Outside' });
    await userEvent.click(outsideButton);
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(onParentClickOutside).not.toHaveBeenCalled();
    expect(onExcludedClickOutside).not.toHaveBeenCalled();
    await userEvent.click(outsideButton);
    expect(onParentClickOutside).toHaveBeenCalledTimes(1);
    expect(onExcludedClickOutside).toHaveBeenCalledTimes(1);
  },
};
