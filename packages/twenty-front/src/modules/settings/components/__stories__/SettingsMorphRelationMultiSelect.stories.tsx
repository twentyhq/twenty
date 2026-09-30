import { SettingsMorphRelationMultiSelect } from '@/settings/components/SettingsMorphRelationMultiSelect';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';

const meta: Meta<typeof SettingsMorphRelationMultiSelect> = {
  title: 'Modules/Settings/SettingsMorphRelationMultiSelect',
  component: SettingsMorphRelationMultiSelect,
  decorators: [ComponentDecorator, ObjectMetadataItemsDecorator],
};
export default meta;
type Story = StoryObj<typeof SettingsMorphRelationMultiSelect>;

export const Default: Story = {
  args: {
    dropdownId: 'test-dropdown',
    disabled: false,
    selectSizeVariant: 'default',
    dropdownWidth: GenericDropdownContentWidth.Medium,
    dropdownWidthAuto: true,
    fullWidth: true,
    label: 'Select objects',
    selectedObjectMetadataIds: [
      '4a45f524-b8cb-40e8-8450-28e402b442cf',
      '6f3b9df6-57c0-4fe0-b8af-1a5ed20d76bd',
    ],
    withSearchInput: true,
    hasRightElement: false,
    onChange: fn(),
  },
};

export const SearchAndToggleStayOpen: Story = {
  args: {
    ...Default.args,
    selectedObjectMetadataIds: [],
    onChange: fn(),
    onBlur: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button');

    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', { name: 'Select objects' });
    const search = within(popup).getByRole('searchbox', { name: 'Search' });

    await waitFor(() => expect(search).toHaveFocus());
    expect(args.onBlur).not.toHaveBeenCalled();
    expect(
      within(within(popup).getByRole('group', { name: 'Advanced' })).getByRole(
        'button',
        { name: 'Attachment' },
      ),
    ).toBeVisible();

    await userEvent.type(search, 'pet');
    expect(
      within(popup).queryByRole('group', { name: 'Advanced' }),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        within(popup).getByRole('button', { name: 'Pet' }),
      ).toHaveAttribute('data-highlighted'),
    );
    await userEvent.keyboard('{Enter}');
    expect(args.onChange).toHaveBeenLastCalledWith([expect.any(String)]);
    expect(within(popup).getByRole('button', { name: 'Pet' })).toBeVisible();
    expect(trigger).toHaveTextContent('Pet');

    await userEvent.click(
      within(popup).getByRole('button', { name: 'Pet Care Agreement' }),
    );
    expect(args.onChange).toHaveBeenLastCalledWith([
      expect.any(String),
      expect.any(String),
    ]);
    expect(popup).toBeVisible();
    expect(trigger).toHaveTextContent('2 Objects');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());

    await userEvent.click(trigger);
    expect(await body.findByRole('searchbox', { name: 'Search' })).toHaveValue(
      '',
    );
    await userEvent.keyboard('{Escape}');
  },
};

export const SingleTabStop: Story = {
  args: {
    ...Default.args,
    selectedObjectMetadataIds: [],
  },
  play: async ({ canvasElement }) => {
    const trigger = await within(canvasElement).findByRole('button');

    await userEvent.tab();
    expect(trigger).toHaveFocus();
    await userEvent.tab();
    expect(canvasElement).not.toContainElement(
      canvasElement.ownerDocument.activeElement as HTMLElement,
    );
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Select objects')).toBeVisible();
    expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByText('Select objects'));
    expect(
      within(canvasElement.ownerDocument.body).queryByRole('dialog'),
    ).not.toBeInTheDocument();
  },
};
