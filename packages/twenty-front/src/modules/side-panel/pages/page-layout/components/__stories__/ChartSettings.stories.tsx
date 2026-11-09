import { CommandMenuItemDropdownTrigger } from '@/command-menu/components/CommandMenuItemDropdownTrigger';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { Dropdown } from 'twenty-ui/components/navigation';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { SIDE_PANEL_SELECTABLE_LIST_ID } from '@/side-panel/constants/SidePanelSelectableListId';
import { ChartSettingsStory } from '@/side-panel/pages/page-layout/components/__stories__/ChartSettingsStory';
import { CHART_SETTINGS_STORY_DATA } from '@/side-panel/pages/page-layout/components/__stories__/chartSettingsStoryData';
import { initializeChartSettingsStory } from '@/side-panel/pages/page-layout/components/__stories__/initializeChartSettingsStory';
import { ChartColorSelectionDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartColorSelectionDropdownContent';
import { ChartDataSourceDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartDataSourceDropdownContent';
import { ChartNumberFormatSelectionDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartNumberFormatSelectionDropdownContent';
import { SidePanelDashboardChartSettings } from '@/side-panel/pages/page-layout/components/dashboard/SidePanelDashboardChartSettings';
import { PageLayoutSidePanelTargetContext } from '@/side-panel/pages/page-layout/contexts/PageLayoutSidePanelTargetContext';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/side-panel/pages/page-layout/types/ChartConfigurationSettingIds';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { msg } from '@lingui/core/macro';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import {
  IconBuildingSkyscraper,
  IconNumber,
  IconColorSwatch,
} from 'twenty-ui/icon';
import {
  DASHBOARD_DATE_RANGE_FILTER,
  DASHBOARD_DATE_RANGE_FILTER_ID,
} from 'twenty-shared/constants';
import {
  type ChartFilter,
  type PageLayoutFilter,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const onBackgroundClickOutside = fn();
const draftState = pageLayoutDraftComponentState.atomFamily({
  instanceId: CHART_SETTINGS_STORY_DATA.pageLayoutId,
});

const meta: Meta<typeof ChartSettingsStory> = {
  title: 'Modules/SidePanel/PageLayout/ChartSettings',
  component: ChartSettingsStory,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    ObjectMetadataItemsDecorator,
  ],
  parameters: { container: { width: 900, height: 600 } },
  args: {
    onBackgroundClickOutside,
    items: [
      {
        id: CHART_CONFIGURATION_SETTING_IDS.SOURCE,
        label: msg`Source`,
        Icon: IconBuildingSkyscraper,
        isBoolean: false,
        DropdownContent: ChartDataSourceDropdownContent,
      },
      {
        id: CHART_CONFIGURATION_SETTING_IDS.COLORS,
        label: msg`Colors`,
        Icon: IconColorSwatch,
        isBoolean: false,
        dropdownWidth: 320,
        DropdownContent: ChartColorSelectionDropdownContent,
      },
      {
        id: CHART_CONFIGURATION_SETTING_IDS.FORMAT,
        label: msg`Format`,
        Icon: IconNumber,
        isBoolean: false,
        DropdownContent: ChartNumberFormatSelectionDropdownContent,
      },
    ],
  },
  beforeEach: () => {
    initializeChartSettingsStory();
    onBackgroundClickOutside.mockClear();
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SearchAndCommitSourceWithKeyboard: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await body.findByRole('button', { name: /^Source/ });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const search = await body.findByRole('searchbox', {
      name: 'Search objects',
    });
    await waitFor(() => expect(search).toHaveFocus());
    expect(
      jotaiStore.get(
        selectedItemIdComponentState.atomFamily({
          instanceId: SIDE_PANEL_SELECTABLE_LIST_ID,
        }),
      ),
    ).toBe(CHART_CONFIGURATION_SETTING_IDS.SOURCE);
    await userEvent.type(search, 'compan');
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false'),
    );
    expect(jotaiStore.get(draftState).tabs[0].widgets[0]).toEqual(
      expect.objectContaining({
        objectMetadataId: getMockObjectMetadataItemOrThrow('company').id,
        configuration: expect.objectContaining({
          aggregateFieldMetadataId: undefined,
          primaryAxisGroupByFieldMetadataId: undefined,
          filter: {},
        }),
      }),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(onBackgroundClickOutside).not.toHaveBeenCalled();
  },
};

export const FilterColorsAndSwitchPickers: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const colorsTrigger = await body.findByRole('button', { name: /^Colors/ });
    await userEvent.click(colorsTrigger);
    const search = await body.findByRole('searchbox', {
      name: 'Search colors',
    });
    const popup = body.getByRole('dialog');
    await waitFor(() => {
      const popupBounds = popup.getBoundingClientRect();
      const triggerBounds = colorsTrigger.getBoundingClientRect();
      expect(popupBounds.width).toBeCloseTo(320);
      expect(
        Math.abs(popupBounds.right - triggerBounds.right),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(popupBounds.top - triggerBounds.bottom - 4),
      ).toBeLessThanOrEqual(1);
    });
    await userEvent.type(search, 'no matching palette');
    expect(await body.findByText('No results found')).toBeVisible();
    expect(
      body.queryByRole('option', { name: 'Default palette' }),
    ).not.toBeInTheDocument();
    await userEvent.clear(search);
    await userEvent.type(search, 'red');
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(colorsTrigger).toHaveAttribute('aria-expanded', 'false'),
    );
    expect(jotaiStore.get(draftState).tabs[0].widgets[0].configuration).toEqual(
      expect.objectContaining({ color: 'red' }),
    );
    await userEvent.click(colorsTrigger);
    await waitFor(() =>
      expect(
        body.getByRole('searchbox', { name: 'Search colors' }),
      ).toHaveValue(''),
    );
    const formatTrigger = body.getByRole('button', { name: /^Format/ });
    await userEvent.click(formatTrigger);
    await waitFor(() =>
      expect(colorsTrigger).toHaveAttribute('aria-expanded', 'false'),
    );
    expect(formatTrigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(formatTrigger);
    const fullOption = await body.findByRole('option', { name: 'Full' });
    await waitFor(() =>
      expect(colorsTrigger).toHaveAttribute('aria-expanded', 'false'),
    );
    expect(formatTrigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(fullOption);
    await waitFor(() =>
      expect(formatTrigger).toHaveAttribute('aria-expanded', 'false'),
    );
    expect(jotaiStore.get(draftState).tabs[0].widgets[0].configuration).toEqual(
      expect.objectContaining({ numberFormat: 'FULL' }),
    );
    expect(onBackgroundClickOutside).not.toHaveBeenCalled();
  },
};

export const DisabledTrigger: Story = {
  render: () => (
    <ChartSettingsStory items={[]}>
      <DropdownRoot dropdownId="disabled-chart-setting" type="picker">
        <CommandMenuItemDropdownTrigger
          id="disabled-setting"
          label="Disabled chart setting"
          disabled
        />
        <DropdownContent>
          <Dropdown.OptionItem selected={false}>
            Unavailable option
          </Dropdown.OptionItem>
        </DropdownContent>
      </DropdownRoot>
    </ChartSettingsStory>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await body.findByRole('button', {
      name: 'Disabled chart setting',
    });
    expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(
      body.queryByRole('button', { name: 'Unavailable option' }),
    ).not.toBeInTheDocument();
  },
};

const DashboardChartSettingsStory = () => (
  <SidePanelPageComponentInstanceContext.Provider
    value={{ instanceId: CHART_SETTINGS_STORY_DATA.pageLayoutId }}
  >
    <PageLayoutSidePanelTargetContext.Provider
      value={{
        pageLayoutId: CHART_SETTINGS_STORY_DATA.pageLayoutId,
        targetRecordIdentifier: {
          targetObjectNameSingular: 'opportunity',
          id: 'chart-story-record',
        },
      }}
    >
      <SidePanelDashboardChartSettings />
    </PageLayoutSidePanelTargetContext.Provider>
  </SidePanelPageComponentInstanceContext.Provider>
);

export const DashboardFiltersListTheBuiltInDateRange: Story = {
  beforeEach: () => {
    const previousWorkspace = jotaiStore.get(currentWorkspaceState.atom);

    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        { key: FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED, value: true },
      ],
    });
    jotaiStore.set(draftState, (pageLayoutDraft) => ({
      ...pageLayoutDraft,
      filters: null,
    }));

    return () => jotaiStore.set(currentWorkspaceState.atom, previousWorkspace);
  },
  render: () => <DashboardChartSettingsStory />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const createdAt = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('opportunity'),
      fieldName: 'createdAt',
    });
    const trigger = await body.findByRole('button', { name: /^Date range/ });

    expect(body.getByText('Dashboard filters')).toBeVisible();
    expect(trigger).toHaveTextContent(`Default (${createdAt.label})`);

    await userEvent.click(trigger);

    const ignoredOption = await body.findByRole('option', { name: 'Ignored' });
    const defaultOption = body.getByRole('option', { name: /^Default/ });

    expect(ignoredOption.previousElementSibling).toHaveAttribute(
      'role',
      'separator',
    );
    expect(defaultOption.nextElementSibling).toHaveAttribute(
      'role',
      'separator',
    );
    for (const option of body.getAllByRole('option')) {
      expect(option.querySelector('svg')).not.toBeNull();
    }

    await userEvent.click(ignoredOption);

    await waitFor(() => expect(trigger).toHaveTextContent('Ignored'));
  },
};

const CLOSE_DATE_FIELD = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: getMockObjectMetadataItemOrThrow('opportunity'),
  fieldName: 'closeDate',
});

const CLOSE_DATE_CONDITION = {
  id: 'close-date-condition',
  fieldMetadataId: CLOSE_DATE_FIELD.id,
  operand: 'IS_RELATIVE',
  value: 'PAST_30_DAY',
};

const OVERLAP_INFORMATION =
  'This widget also filters on Close date. Records must match both.';

const getEditedChartConfiguration = () =>
  jotaiStore.get(draftState).tabs[0].widgets[0].configuration;

const NO_DEFAULT_HINT =
  'With no default range, this widget shows every date until a viewer picks one.';

const initializeChartFilteredOnCloseDate = (
  filter: ChartFilter,
  dashboardFilters: PageLayoutFilter[] | null = null,
) => {
  const previousWorkspace = jotaiStore.get(currentWorkspaceState.atom);

  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      { key: FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED, value: true },
    ],
  });
  jotaiStore.set(draftState, (pageLayoutDraft) => ({
    ...pageLayoutDraft,
    filters: dashboardFilters,
    tabs: pageLayoutDraft.tabs.map((tab) => ({
      ...tab,
      widgets: tab.widgets.map((widget) => ({
        ...widget,
        configuration: { ...widget.configuration, filter },
      })),
    })),
  }));

  return () => jotaiStore.set(currentWorkspaceState.atom, previousWorkspace);
};

export const LetsTheDateRangeControlAFieldOfTheWidgetFilter: Story = {
  beforeEach: () =>
    initializeChartFilteredOnCloseDate({
      recordFilters: [CLOSE_DATE_CONDITION],
      recordFilterGroups: [],
    }),
  render: () => <DashboardChartSettingsStory />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await body.findByRole('button', { name: /^Date range/ });

    expect(trigger).toHaveTextContent('Default (Close date)');
    expect(body.getByText(OVERLAP_INFORMATION)).toBeVisible();
    expect(body.queryByText(NO_DEFAULT_HINT)).not.toBeInTheDocument();

    const letDateRangeControlButton = await body.findByRole('button', {
      name: 'Let Date range control this',
    });

    await userEvent.hover(letDateRangeControlButton);
    expect(await body.findByRole('tooltip')).toHaveTextContent(NO_DEFAULT_HINT);
    await userEvent.unhover(letDateRangeControlButton);
    await waitFor(() =>
      expect(body.queryByRole('tooltip')).not.toBeInTheDocument(),
    );

    letDateRangeControlButton.focus();
    expect(await body.findByRole('tooltip')).toHaveTextContent(NO_DEFAULT_HINT);

    await userEvent.click(letDateRangeControlButton);

    await waitFor(() => expect(trigger).toHaveTextContent('Close date'));
    expect(trigger).not.toHaveTextContent('Default');
    expect(body.queryByText(OVERLAP_INFORMATION)).not.toBeInTheDocument();
    expect(getEditedChartConfiguration()).toMatchObject({
      filter: { recordFilters: [] },
      dashboardFilterBindings: [
        {
          pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
          fieldMetadataId: CLOSE_DATE_FIELD.id,
        },
      ],
    });
  },
};

export const LetsTheDateRangeControlAFieldWithoutHintWhenItHasADefault: Story =
  {
    beforeEach: () =>
      initializeChartFilteredOnCloseDate(
        { recordFilters: [CLOSE_DATE_CONDITION], recordFilterGroups: [] },
        [
          {
            ...DASHBOARD_DATE_RANGE_FILTER,
            defaultValue: {
              conditions: [
                {
                  operand: ViewFilterOperand.IS_RELATIVE,
                  value: 'THIS_1_MONTH',
                },
              ],
            },
          },
        ],
      ),
    render: () => <DashboardChartSettingsStory />,
    play: async ({ canvasElement }) => {
      const body = within(canvasElement.ownerDocument.body);

      const letDateRangeControlButton = await body.findByRole('button', {
        name: 'Let Date range control this',
      });

      expect(letDateRangeControlButton).toBeVisible();
      expect(body.getByText(OVERLAP_INFORMATION)).toBeVisible();

      await userEvent.hover(letDateRangeControlButton);
      letDateRangeControlButton.focus();
      // Past the tooltip delay, so a tooltip would have opened by now
      await new Promise((resolve) =>
        setTimeout(resolve, TooltipDelay.mediumDelay * 2),
      );
      expect(body.queryByText(NO_DEFAULT_HINT)).not.toBeInTheDocument();
    },
  };

export const OnlyWarnsWhenTheFieldIsInAnOrGroup: Story = {
  beforeEach: () =>
    initializeChartFilteredOnCloseDate({
      recordFilters: [{ ...CLOSE_DATE_CONDITION, recordFilterGroupId: 'or' }],
      recordFilterGroups: [{ id: 'or', logicalOperator: 'OR' }],
    }),
  render: () => <DashboardChartSettingsStory />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    expect(await body.findByText(OVERLAP_INFORMATION)).toBeVisible();
    expect(
      body.queryByRole('button', { name: 'Let Date range control this' }),
    ).not.toBeInTheDocument();
  },
};
