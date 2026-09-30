import { AdvancedFilterRecordFilterRow } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterRow';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { type ComponentProps } from 'react';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { type PageDecoratorArgs } from '~/testing/decorators/PageDecorator';
import { ADVANCED_FILTER_STORY_DATA } from '~/testing/mock-data/advanced-filter-story-data';
import { AdvancedFilterViewDecorator } from '~/testing/decorators/AdvancedFilterViewDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const { instanceId, objectMetadataItem, recordFilterGroup, recordFilter } =
  ADVANCED_FILTER_STORY_DATA;

type AdvancedFilterRecordFilterRowStoryArgs = ComponentProps<
  typeof AdvancedFilterRecordFilterRow
> &
  PageDecoratorArgs;

const meta: Meta<AdvancedFilterRecordFilterRowStoryArgs> = {
  title: 'Modules/ObjectRecord/AdvancedFilter/RecordFilterRow',
  component: AdvancedFilterRecordFilterRow,
  decorators: [
    AdvancedFilterViewDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    ComponentWithRouterDecorator,
    IconsProviderDecorator,
  ],
  args: {
    routePath: '/objects/:objectNamePlural',
    routeParams: { ':objectNamePlural': objectMetadataItem.namePlural },
    recordFilterGroup,
    recordFilter,
    recordFilterIndex: 0,
  },
  parameters: {
    container: { width: 900 },
  },
};

export default meta;
type Story = StoryObj<AdvancedFilterRecordFilterRowStoryArgs>;

export const SearchAndSelectWithEnter: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole('button', { name: 'Name' }));
    const popup = await body.findByRole('dialog', { name: 'Select field' });
    const search = within(popup).getByRole('searchbox', {
      name: 'Search fields',
    });
    await waitFor(() => expect(search).toHaveFocus());
    expect(within(popup).getByText('Visible fields')).toBeVisible();
    expect(within(popup).getByText('Hidden fields')).toBeVisible();
    await userEvent.type(search, 'Stage');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => expect(popup).not.toBeInTheDocument());
    const stageTrigger = await canvas.findByRole('button', { name: 'Stage' });
    await expect(stageTrigger).toHaveFocus();
    const stageField = objectMetadataItem.fields.find(
      (field) => field.name === 'stage',
    );
    expect(jotaiStore.get(focusStackState.atom)).toContainEqual(
      expect.objectContaining({ focusId: stageField?.id }),
    );

    await userEvent.click(stageTrigger);
    expect(await body.findByPlaceholderText('Search fields')).toHaveValue('');
    await userEvent.keyboard('{Escape}');
    await userEvent.click(await canvas.findByText('Select Stage'));
    const valueSearch = await body.findByPlaceholderText('Stage');
    await waitFor(() => expect(valueSearch).toHaveFocus());
    await userEvent.type(valueSearch, 'Screening');
    await userEvent.click(
      await body.findByRole('option', { name: 'Screening' }),
    );
    await userEvent.keyboard('{Escape}');
    await expect(await canvas.findByText('Screening')).toBeVisible();
  },
};

export const CompositePageAndBack: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole('button', { name: 'Name' }));
    const popup = await body.findByRole('dialog', { name: 'Select field' });
    await userEvent.click(
      within(popup).getByRole('button', { name: 'Amount' }),
    );
    await expect(
      await within(popup).findByRole('button', { name: 'Currency' }),
    ).toBeVisible();
    await userEvent.click(
      within(popup).getByRole('button', { name: 'Back to fields' }),
    );
    await expect(
      await within(popup).findByPlaceholderText('Search fields'),
    ).toBeVisible();
    expect(
      jotaiStore.get(
        currentRecordFiltersComponentState.atomFamily({ instanceId }),
      ),
    ).toEqual([recordFilter]);

    await userEvent.click(
      within(popup).getByRole('button', { name: 'Amount' }),
    );
    await userEvent.click(
      await within(popup).findByRole('button', { name: 'Currency' }),
    );
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    const fieldTrigger = await canvas.findByRole('button', {
      name: 'Amount / Currency',
    });
    await userEvent.click(fieldTrigger);
    expect(await body.findByPlaceholderText('Search fields')).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

export const RelationTargetPageAndBack: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole('button', { name: 'Name' }));
    const popup = await body.findByRole('dialog', { name: 'Select field' });
    await userEvent.click(
      within(popup).getByRole('button', { name: 'Company' }),
    );
    await within(popup).findByRole('button', { name: 'Employees' });
    expect(
      within(popup).queryByRole('button', { name: 'Workspace Member' }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      within(popup).getByRole('button', { name: 'Back to fields' }),
    );
    await within(popup).findByPlaceholderText('Search fields');
    expect(
      jotaiStore.get(
        currentRecordFiltersComponentState.atomFamily({ instanceId }),
      ),
    ).toEqual([recordFilter]);

    await userEvent.click(
      within(popup).getByRole('button', { name: 'Company' }),
    );
    await userEvent.click(
      await within(popup).findByRole('button', { name: 'Employees' }),
    );
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await expect(
      await canvas.findByRole('button', { name: 'Company → Employees' }),
    ).toBeVisible();
  },
};

export const WorkspaceMemberRecord: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole('button', { name: 'Name' }));
    const popup = await body.findByRole('dialog', { name: 'Select field' });
    await userEvent.click(within(popup).getByRole('button', { name: 'Owner' }));
    await userEvent.click(
      await within(popup).findByRole('button', { name: 'Workspace Member' }),
    );
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await expect(
      await canvas.findByRole('button', { name: 'Owner' }),
    ).toBeVisible();
    expect(
      jotaiStore.get(
        currentRecordFiltersComponentState.atomFamily({ instanceId }),
      ),
    ).toEqual([
      expect.objectContaining({
        type: 'RELATION',
        relationTargetFieldMetadataId: null,
      }),
    ]);
  },
};
