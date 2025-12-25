import { useArgs } from '@storybook/preview-api';
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';

import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { sleep } from '~/utils/sleep';

import { ComponentDecorator } from 'twenty-ui/testing';
import {
  IconPicker,
  type IconPickerProps,
} from '@/ui/input/components/IconPicker';

type RenderProps = IconPickerProps;
const Render = (args: RenderProps) => {
  const [{ selectedIconKey }, updateArgs] = useArgs();

  return (
    <IconPicker
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...args}
      onChange={({ iconKey }) => {
        updateArgs({ selectedIconKey: iconKey });
      }}
      selectedIconKey={selectedIconKey}
    />
  );
};

const meta: Meta<typeof IconPicker> = {
  title: 'UI/Input/IconPicker/IconPicker',
  component: IconPicker,
  decorators: [I18nFrontDecorator, IconsProviderDecorator, ComponentDecorator],
  render: Render,
};

export default meta;
type Story = StoryObj<typeof IconPicker>;

export const Default: Story = {};

export const WithOpen: Story = {
  play: async () => {
    const canvas = within(document.body);

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
  play: async () => {
    const canvas = within(document.body);

    const iconPickerButton = await canvas.findByRole('button', {
      name: 'Click to select icon (selected: IconCalendarEvent)',
    });

    await userEvent.click(iconPickerButton);
  },
};

export const WithSearch: Story = {
  ...WithSelectedIcon,
  play: async () => {
    const canvas = within(document.body);

    const iconPickerButton = await canvas.findByRole('button', {
      name: 'Click to select icon (selected: IconCalendarEvent)',
    });

    await userEvent.click(iconPickerButton);

    const searchInput = await canvas.findByRole('textbox');

    await userEvent.type(searchInput, 'Building skyscraper');

    await sleep(100);

    const searchedIcon = await canvas.findByRole('button', {
      name: 'Icon Building Skyscraper',
    });

    expect(searchedIcon).toBeInTheDocument();
  },
};

export const WithSearchAndClose: Story = {
  ...WithSelectedIcon,
  play: async () => {
    const canvas = within(document.body);

    let iconPickerButton = await canvas.findByRole('button', {
      name: 'Click to select icon (selected: IconCalendarEvent)',
    });

    await userEvent.click(iconPickerButton);

    let searchInput = await canvas.findByRole('textbox');

    await userEvent.type(searchInput, 'Building skyscraper');

    await sleep(100);

    const searchedIcon = await canvas.findByRole('button', {
      name: 'Icon Building Skyscraper',
    });

    expect(searchedIcon).toBeInTheDocument();

    await userEvent.click(searchedIcon);

    await sleep(500);

    expect(searchedIcon).not.toBeInTheDocument();

    iconPickerButton = await canvas.findByRole('button', {
      name: 'Click to select icon (selected: IconBuildingSkyscraper)',
    });

    await userEvent.click(iconPickerButton);

    await sleep(500);

    searchInput = await canvas.findByRole('textbox');

    expect(searchInput).toHaveValue('');
  },
};
