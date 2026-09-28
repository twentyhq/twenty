import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { AdvancedFilterDropdownButton } from '@/views/advanced-filter-chip/components/AdvancedFilterDropdownButton';
import { ADVANCED_FILTER_STORY_DATA } from '~/testing/mock-data/advanced-filter-story-data';
import { AdvancedFilterViewDecorator } from '~/testing/decorators/AdvancedFilterViewDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const { instanceId } = ADVANCED_FILTER_STORY_DATA;

const meta: Meta<typeof AdvancedFilterDropdownButton> = {
  title: 'Modules/Views/AdvancedFilterDropdownButton',
  component: AdvancedFilterDropdownButton,
  decorators: [
    AdvancedFilterViewDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    ComponentDecorator,
    IconsProviderDecorator,
  ],
  render: () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: 900,
      }}
    >
      <AdvancedFilterDropdownButton />
      <Button>Outside filter</Button>
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof AdvancedFilterDropdownButton>;

export const NestedPickerDismissal: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByText('1 advanced rule'));
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Contains' }),
    );
    await expect(
      await canvas.findByRole('dialog', { name: 'Select operand' }),
    ).toBeVisible();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(
        canvas.queryByRole('dialog', { name: 'Select operand' }),
      ).toBeNull();
    });
    await expect(canvas.getByRole('listbox')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Contains' }),
    ).toHaveFocus();

    await userEvent.click(canvas.getByRole('button', { name: 'Contains' }));
    await canvas.findByRole('dialog', { name: 'Select operand' });
    await userEvent.click(
      canvas.getByRole('button', { name: 'Outside filter' }),
    );

    await waitFor(() => {
      expect(
        canvas.queryByRole('dialog', { name: 'Select operand' }),
      ).toBeNull();
    });
    await expect(canvas.getByRole('listbox')).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Outside filter' }),
    );

    await waitFor(() => {
      expect(canvas.queryByRole('listbox')).toBeNull();
      expect(jotaiStore.get(focusStackState.atom)).toEqual([]);
    });
  },
};

export const AddRulesAndRemoveGroup: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByText('1 advanced rule'));
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Add filter rule' }),
    );
    await userEvent.click(
      await canvas.findByRole('menuitem', { name: 'Add rule' }),
    );
    await expect(await canvas.findByText('2 advanced rules')).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Add filter rule' }),
    );
    await userEvent.click(
      await canvas.findByRole('menuitem', { name: 'Add rule group' }),
    );
    await expect(await canvas.findByText('3 advanced rules')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Add rule' }));

    await waitFor(() => {
      const filters = jotaiStore.get(
        currentRecordFiltersComponentState.atomFamily({ instanceId }),
      );
      const groups = jotaiStore.get(
        currentRecordFilterGroupsComponentState.atomFamily({ instanceId }),
      );

      expect(filters).toHaveLength(4);
      expect(groups).toHaveLength(2);
      expect(
        filters.map((filter) => filter.positionInRecordFilterGroup),
      ).toEqual([0, 1, 1, 2]);
      expect(groups[1]?.positionInRecordFilterGroup).toBe(2);
    });

    await userEvent.click(
      canvas.getByRole('button', { name: 'Filter group rule options' }),
    );
    await userEvent.click(
      await canvas.findByRole('menuitem', { name: 'Remove rule group' }),
    );

    await expect(await canvas.findByText('2 advanced rules')).toBeVisible();
    await expect(canvas.getByRole('listbox')).toBeVisible();
    await expect(
      jotaiStore.get(
        currentRecordFiltersComponentState.atomFamily({ instanceId }),
      ),
    ).toHaveLength(2);
    await expect(
      jotaiStore.get(
        currentRecordFilterGroupsComponentState.atomFamily({ instanceId }),
      ),
    ).toHaveLength(1);
  },
};

export const RemoveLastRule: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByText('1 advanced rule'));
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Record filter rule options' }),
    );
    await userEvent.click(
      await canvas.findByRole('menuitem', { name: 'Remove rule' }),
    );

    await waitFor(() => {
      expect(canvas.queryByText('1 advanced rule')).toBeNull();
      expect(canvas.queryByRole('listbox')).toBeNull();
      expect(jotaiStore.get(focusStackState.atom)).toEqual([]);
    });
  },
};

export const SelectOperandWithKeyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByText('1 advanced rule'));
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Contains' }),
    );
    const popup = await canvas.findByRole('dialog', {
      name: 'Select operand',
    });

    await waitFor(() => {
      expect(
        within(popup).getByRole('button', { name: 'Contains' }),
      ).toHaveFocus();
    });
    await userEvent.keyboard('{ArrowDown}{Enter}');

    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await expect(
      canvas.getByRole('button', { name: "Doesn't contain" }),
    ).toHaveFocus();
    await expect(canvas.getByRole('listbox')).toBeVisible();
  },
};
