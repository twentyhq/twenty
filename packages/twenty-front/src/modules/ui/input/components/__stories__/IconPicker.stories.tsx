import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';
import { type ThemeColor } from 'twenty-ui/theme';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';

import { IconPicker } from '@/ui/input/components/IconPicker';
import { ComponentDecorator } from 'twenty-ui/testing';

type IconPickerStoryProps = ComponentProps<typeof IconPicker>;

const IconPickerStory = (args: IconPickerStoryProps) => {
  const [selectedIconKey, setSelectedIconKey] = useState(args.selectedIconKey);
  const [selectedColor, setSelectedColor] = useState<ThemeColor>(
    args.iconColorPicker?.selectedColor ?? 'blue',
  );

  return (
    <IconPicker
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...args}
      onChange={({ iconKey }) => {
        setSelectedIconKey(iconKey);
      }}
      selectedIconKey={selectedIconKey}
      iconColorPicker={
        isDefined(args.iconColorPicker)
          ? {
              selectedColor,
              onColorChange: (color) => {
                setSelectedColor(color);
                args.iconColorPicker?.onColorChange(color);
              },
            }
          : undefined
      }
    />
  );
};

const meta: Meta<typeof IconPicker> = {
  title: 'UI/Input/IconPicker/IconPicker',
  component: IconPicker,
  decorators: [IconsProviderDecorator, ComponentDecorator],
  render: (args: IconPickerStoryProps) => (
    // oxlint-disable-next-line react/jsx-props-no-spreading
    <IconPickerStory key={args.selectedIconKey ?? 'no-selection'} {...args} />
  ),
};

export default meta;
type Story = StoryObj<typeof IconPicker>;

export const Default: Story = {};

export const WithOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    const iconPickerButton = await canvas.findByRole('button', {
      name: 'Click to select icon (no icon selected)',
    });

    await userEvent.click(iconPickerButton);
  },
};

export const WithSelectedIcon: Story = {
  args: { selectedIconKey: 'IconCalendarEvent' },
};

export const WithOpenAndSelectedIcon: Story = {
  ...WithSelectedIcon,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    const iconPickerButton = await canvas.findByRole('button', {
      name: 'Click to select icon (selected: IconCalendarEvent)',
    });

    await userEvent.click(iconPickerButton);
  },
};

export const WithSearch: Story = {
  ...WithSelectedIcon,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    const iconPickerButton = await canvas.findByRole('button', {
      name: 'Click to select icon (selected: IconCalendarEvent)',
    });

    await userEvent.click(iconPickerButton);

    const searchInput = await canvas.findByRole('searchbox', {
      name: 'Search icon',
    });

    await userEvent.type(searchInput, 'Building skyscraper');

    const searchedIcon = await canvas.findByRole('button', {
      name: 'Icon Building Skyscraper',
    });

    expect(searchedIcon).toBeInTheDocument();
  },
};

export const WithSearchAndClose: Story = {
  ...WithSelectedIcon,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    let iconPickerButton = await canvas.findByRole('button', {
      name: 'Click to select icon (selected: IconCalendarEvent)',
    });

    await userEvent.click(iconPickerButton);

    let searchInput = await canvas.findByRole('searchbox', {
      name: 'Search icon',
    });

    await userEvent.type(searchInput, 'Building skyscraper');

    const searchedIcon = await canvas.findByRole('button', {
      name: 'Icon Building Skyscraper',
    });

    expect(searchedIcon).toBeInTheDocument();

    await userEvent.click(searchedIcon);

    expect(searchInput).toHaveValue('Building skyscraper');
    await waitFor(() => expect(searchedIcon).not.toBeInTheDocument());

    iconPickerButton = await canvas.findByRole('button', {
      name: 'Click to select icon (selected: IconBuildingSkyscraper)',
    });

    await userEvent.click(iconPickerButton);

    searchInput = await canvas.findByRole('searchbox', { name: 'Search icon' });

    expect(searchInput).toHaveValue('');
  },
};

export const GridKeyboard: Story = {
  ...WithSelectedIcon,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = body.getByRole('button', {
      name: 'Click to select icon (selected: IconCalendarEvent)',
    });

    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', { name: 'Choose icon' });
    await waitFor(() =>
      expect(within(dialog).getAllByRole('button')).toHaveLength(25),
    );
    const icons = within(dialog).getAllByRole('button');
    const [firstIcon, , , , , , seventhIcon] = icons;
    assertIsDefinedOrThrow(firstIcon);
    assertIsDefinedOrThrow(seventhIcon);

    expect(firstIcon.querySelector('svg')).toBeVisible();
    expect(firstIcon).toHaveAccessibleName('Icon Calendar Event');
    await waitFor(() =>
      expect(within(dialog).getByRole('searchbox')).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowDown}{ArrowRight}{ArrowDown}');
    expect(seventhIcon).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}{ArrowUp}');
    expect(firstIcon).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const SearchEnter: Story = {
  ...WithSelectedIcon,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      body.getByRole('button', {
        name: 'Click to select icon (selected: IconCalendarEvent)',
      }),
    );
    const search = await body.findByRole('searchbox', { name: 'Search icon' });

    await userEvent.type(search, 'Building skyscraper');
    await body.findByRole('button', { name: 'Icon Building Skyscraper' });
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(
      body.getByRole('button', {
        name: 'Click to select icon (selected: IconBuildingSkyscraper)',
      }),
    ).toBeVisible();
  },
};

export const NestedColorPicker: Story = {
  ...WithSelectedIcon,
  args: {
    ...WithSelectedIcon.args,
    iconColorPicker: { selectedColor: 'blue', onColorChange: fn() },
  },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      body.getByRole('button', {
        name: 'Click to select icon (selected: IconCalendarEvent)',
      }),
    );
    const iconDialog = await body.findByRole('dialog', { name: 'Choose icon' });
    const colorTrigger = within(iconDialog).getByRole('button', {
      name: 'Choose icon color',
    });

    await userEvent.click(colorTrigger);
    const colorDialog = await body.findByRole('dialog', {
      name: 'Choose icon color',
    });

    await userEvent.type(
      within(colorDialog).getByRole('searchbox', { name: 'Search colors' }),
      'red',
    );
    await userEvent.keyboard('{Enter}');
    expect(args.iconColorPicker?.onColorChange).toHaveBeenCalledWith('red');
    await waitFor(() => expect(colorDialog).not.toBeInTheDocument());
    expect(iconDialog).toBeVisible();
    await waitFor(() => expect(colorTrigger).toHaveFocus());
    await userEvent.click(colorTrigger);
    const reopened = await body.findByRole('dialog', {
      name: 'Choose icon color',
    });

    expect(within(reopened).getByRole('searchbox')).toHaveValue('');
    expect(
      within(reopened).getByRole('button', { name: 'Red' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(reopened).not.toBeInTheDocument());
    expect(iconDialog).toBeVisible();
  },
};

export const DisabledCompositeTrigger: Story = {
  args: { disabled: true, clickableComponent: <div>Readonly icon</div> },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = body.getByRole('button', { name: 'Readonly icon' });

    await userEvent.click(trigger);
    expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(body.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

export const LoadMoreAndReset: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = body.getByRole('button', {
      name: 'Click to select icon (no icon selected)',
    });

    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', { name: 'Choose icon' });

    await waitFor(() =>
      expect(within(dialog).getAllByRole('button')).toHaveLength(25),
    );
    const scrollContainer = within(dialog).getByRole('group', {
      name: 'Icons',
    });

    scrollContainer.scrollTo({ top: scrollContainer.scrollHeight });
    await waitFor(() =>
      expect(within(dialog).getAllByRole('button')).toHaveLength(50),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await userEvent.click(trigger);
    const reopened = await body.findByRole('dialog', { name: 'Choose icon' });

    expect(within(reopened).getAllByRole('button')).toHaveLength(25);
  },
};

export const CompositeTriggerKeyboard: Story = {
  args: { clickableComponent: <div>Choose workflow icon</div> },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = body.getByRole('button', { name: 'Choose workflow icon' });

    await userEvent.tab();
    expect(trigger).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    const dialog = await body.findByRole('dialog', { name: 'Choose icon' });

    await waitFor(() =>
      expect(within(dialog).getByRole('searchbox')).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
