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
    const buttons = within(popup).getAllByRole('button');
    expect(buttons.map((button) => button.textContent)).toEqual([
      'Use default',
      'Éclair',
      'Option B',
      'Option C',
      'Add option',
    ]);
    const disabled = within(popup).getByRole('button', { name: 'Option B' });
    expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(disabled);
    expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.click(
      within(popup).getByRole('button', { name: 'Add option' }),
    );
    expect(args.callToActionButton?.onClick).toHaveBeenCalledTimes(1);
    expect(popup).toBeVisible();
    const search = within(popup).getByRole('searchbox', { name: 'Search' });
    await userEvent.type(search, 'pastry');
    expect(
      within(popup).queryByRole('button', { name: 'Option C' }),
    ).not.toBeInTheDocument();
    expect(
      within(popup).queryByRole('button', { name: 'Use default' }),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        within(popup).getByRole('button', { name: 'Éclair' }),
      ).toHaveAttribute('data-highlighted'),
    );
    await userEvent.keyboard('{Enter}');
    expect(args.onChange).toHaveBeenCalledWith('a');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const KeyboardStartsAtSelection: Story = {
  args: { value: 'b', onChange: fn(), onBlur: fn() },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button');
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    const selected = await body.findByRole('button', {
      name: 'Option B',
      pressed: true,
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
      await body.findByRole('button', { name: 'Option B' }),
    );
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(onParentClick).not.toHaveBeenCalled();
    expect(onParentClickOutside).not.toHaveBeenCalled();
    expect(onExcludedClickOutside).not.toHaveBeenCalled();
    await userEvent.click(trigger);
    await body.findByRole('dialog');
    await userEvent.click(canvas.getByRole('button', { name: 'Outside' }));
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(onParentClickOutside).toHaveBeenCalledTimes(1);
    expect(onExcludedClickOutside).toHaveBeenCalledTimes(1);
  },
};
