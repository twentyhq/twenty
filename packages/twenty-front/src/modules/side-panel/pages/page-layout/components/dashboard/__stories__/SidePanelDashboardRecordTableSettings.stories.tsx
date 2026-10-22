import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { SIDE_PANEL_SELECTABLE_LIST_ID } from '@/side-panel/constants/SidePanelSelectableListId';
import { RecordTableWidgetSettingsStory } from '@/side-panel/pages/page-layout/components/dashboard/__stories__/RecordTableWidgetSettingsStory';
import { initializeRecordTableWidgetSettingsStory } from '@/side-panel/pages/page-layout/components/dashboard/__stories__/initializeRecordTableWidgetSettingsStory';
import { RECORD_TABLE_WIDGET_SETTINGS_STORY_DATA } from '@/side-panel/pages/page-layout/components/dashboard/__stories__/recordTableWidgetSettingsStoryData';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ViewCalendarLayout, ViewType } from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const onBackgroundClickOutside = fn();
const { pageLayoutId, widgetId } = RECORD_TABLE_WIDGET_SETTINGS_STORY_DATA;
const getWidgetViewSnapshot = () =>
  jotaiStore.get(
    recordTableWidgetViewDraftComponentState.atomFamily({
      instanceId: pageLayoutId,
    }),
  )[widgetId];

const meta: Meta<typeof RecordTableWidgetSettingsStory> = {
  title: 'Modules/SidePanel/PageLayout/SidePanelDashboardRecordTableSettings',
  component: RecordTableWidgetSettingsStory,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    ObjectMetadataItemsDecorator,
  ],
  parameters: { container: { width: 900, height: 620 } },
  args: { onBackgroundClickOutside },
  beforeEach: () => {
    initializeRecordTableWidgetSettingsStory();
    onBackgroundClickOutside.mockClear();
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LayoutAndCalendarSelection: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await body.findByRole('button', { name: /^Layout/ });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    expect(await body.findByRole('option', { name: 'Table' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      body.getAllByRole('option').map((option) => option.textContent),
    ).toEqual(['Table', 'Kanban', 'List', 'Calendar']);
    await waitFor(() => {
      const popupBounds = body.getByRole('dialog').getBoundingClientRect();
      const triggerBounds = trigger.getBoundingClientRect();
      expect(popupBounds.width).toBeCloseTo(200);
      expect(
        Math.abs(popupBounds.right - triggerBounds.right),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(popupBounds.top - triggerBounds.bottom),
      ).toBeLessThanOrEqual(1);
    });
    expect(
      jotaiStore.get(
        selectedItemIdComponentState.atomFamily({
          instanceId: SIDE_PANEL_SELECTABLE_LIST_ID,
        }),
      ),
    ).toBe('object-view-layout');
    await userEvent.click(body.getByRole('option', { name: 'Calendar' }));
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus();
      expect(getWidgetViewSnapshot().view.type).toBe(ViewType.CALENDAR_WIDGET);
    });
    const dateFieldTrigger = body.getByRole('button', { name: /^Date field/ });
    await userEvent.click(dateFieldTrigger);
    await userEvent.click(
      await body.findByRole('option', { name: 'Close date' }),
    );
    await waitFor(() =>
      expect(dateFieldTrigger).toHaveAttribute('aria-expanded', 'false'),
    );
    const opportunity = getMockObjectMetadataItemOrThrow('opportunity');
    const closeDate = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: opportunity,
      fieldName: 'closeDate',
    });
    expect(getWidgetViewSnapshot().view.calendarFieldMetadataId).toBe(
      closeDate.id,
    );
    const calendarTrigger = body.getByRole('button', {
      name: /^Calendar view/,
    });
    await userEvent.click(calendarTrigger);
    await userEvent.click(await body.findByRole('option', { name: 'Week' }));
    await waitFor(() =>
      expect(calendarTrigger).toHaveAttribute('aria-expanded', 'false'),
    );
    expect(getWidgetViewSnapshot().view.calendarLayout).toBe(
      ViewCalendarLayout.WEEK,
    );
    expect(onBackgroundClickOutside).not.toHaveBeenCalled();
  },
};

export const SearchGroupWithKeyboard: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await body.findByRole('button', { name: /^Group by/ });
    await userEvent.click(trigger);
    const search = await body.findByRole('searchbox', {
      name: 'Search fields',
    });
    await userEvent.type(search, 'stage');
    expect(
      body.queryByRole('option', { name: 'None' }),
    ).not.toBeInTheDocument();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false'),
    );
    const opportunity = getMockObjectMetadataItemOrThrow('opportunity');
    const stage = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: opportunity,
      fieldName: 'stage',
    });
    expect(getWidgetViewSnapshot().view.mainGroupByFieldMetadataId).toBe(
      stage.id,
    );
    await userEvent.click(trigger);
    expect(
      await body.findByRole('searchbox', { name: 'Search fields' }),
    ).toHaveValue('');
    expect(body.getByRole('option', { name: 'Stage' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.click(body.getByRole('option', { name: 'None' }));
    expect(getWidgetViewSnapshot().view.mainGroupByFieldMetadataId).toBeNull();
    expect(onBackgroundClickOutside).not.toHaveBeenCalled();
  },
};

export const SearchSourceAndResetView: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await body.findByRole('button', { name: /^Source/ });
    await userEvent.click(trigger);
    const search = await body.findByRole('searchbox', {
      name: 'Search objects',
    });
    await userEvent.type(search, 'compan');
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false'),
    );
    const company = getMockObjectMetadataItemOrThrow('company');
    await waitFor(() => {
      const widget = jotaiStore.get(
        pageLayoutDraftComponentState.atomFamily({ instanceId: pageLayoutId }),
      ).tabs[0].widgets[0];
      expect(widget.objectMetadataId).toBe(company.id);
      expect(widget.title).toBe(company.labelPlural);
      expect(getWidgetViewSnapshot().view.objectMetadataId).toBe(company.id);
    });
    await userEvent.click(trigger);
    expect(
      await body.findByRole('searchbox', { name: 'Search objects' }),
    ).toHaveValue('');
    await userEvent.keyboard('{Escape}');
    expect(onBackgroundClickOutside).not.toHaveBeenCalled();
  },
};

export const ReorderHideAndShowFields: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await body.findByRole('button', { name: /^Fields/ });
    await userEvent.click(trigger);
    const stageRow = await body.findByRole('button', { name: /^Stage/ });
    stageRow.focus();
    await userEvent.keyboard(' ');
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
    await userEvent.keyboard(' ');
    await waitFor(() => {
      const stageField = getWidgetViewSnapshot().viewFields.find(
        (field) => field.id === 'table-story-stage',
      );
      expect(stageField?.position).not.toBe(1);
    });
    await userEvent.click(body.getByRole('button', { name: 'Hide Amount' }));
    expect(
      getWidgetViewSnapshot().viewFields.find(
        (field) => field.id === 'table-story-amount',
      )?.isVisible,
    ).toBe(false);
    const hiddenFieldsOpener = body.getByRole('button', {
      name: 'Hidden Fields',
    });
    await userEvent.click(hiddenFieldsOpener);
    await userEvent.click(
      await body.findByRole('button', { name: 'Show Amount' }),
    );
    expect(
      getWidgetViewSnapshot().viewFields.find(
        (field) => field.id === 'table-story-amount',
      )?.isVisible,
    ).toBe(true);
    await userEvent.click(body.getByRole('button', { name: 'Hidden Fields' }));
    await waitFor(() => expect(hiddenFieldsOpener).toHaveFocus());
    expect(body.getByText('Amount')).toBeVisible();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    expect(
      await body.findByRole('button', { name: 'Hidden Fields' }),
    ).toBeVisible();
    expect(body.getByText('Amount')).toBeVisible();
    expect(onBackgroundClickOutside).not.toHaveBeenCalled();
  },
};

export const LayoutWithoutViewIsDisabled: Story = {
  beforeEach: () =>
    initializeRecordTableWidgetSettingsStory({ hasView: false }),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await body.findByRole('button', { name: /^Layout/ });
    expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(
      body.queryByRole('option', { name: 'Table' }),
    ).not.toBeInTheDocument();
  },
};

export const EmbeddedViewLayoutRows: Story = {
  args: { shouldShowLayoutRowsOnly: true },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await body.findByRole('button', { name: /^Layout/ });
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('option', { name: 'List' }));
    await waitFor(() => expect(trigger).toHaveTextContent('List'));
    expect(getWidgetViewSnapshot().view.type).toBe(ViewType.LIST_WIDGET);
    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('option', { name: 'Calendar' }),
    );
    expect(
      await body.findByRole('button', { name: /^Calendar view/ }),
    ).toHaveTextContent('Month');
    expect(onBackgroundClickOutside).not.toHaveBeenCalled();
  },
};
