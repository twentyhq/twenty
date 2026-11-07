import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { ChartSettingsStory } from '@/side-panel/pages/page-layout/components/__stories__/ChartSettingsStory';
import { CHART_SETTINGS_STORY_DATA } from '@/side-panel/pages/page-layout/components/__stories__/chartSettingsStoryData';
import { initializeChartSettingsStory } from '@/side-panel/pages/page-layout/components/__stories__/initializeChartSettingsStory';
import { ChartFieldSelectionForAggregateOperationDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartFieldSelectionForAggregateOperationDropdownContent';
import { ChartSortBySelectionDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartSortBySelectionDropdownContent';
import { ChartXAxisFieldSelectionDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartXAxisFieldSelectionDropdownContent';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/side-panel/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/side-panel/pages/page-layout/types/ChartSettingsGroup';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { msg } from '@lingui/core/macro';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { IconChartBar, IconSortAscending } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  AggregateOperations,
  GraphOrderBy,
} from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const GROUP_BY_ITEM: ChartSettingsItem = {
  id: CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X,
  label: msg`Group by`,
  Icon: IconChartBar,
  isBoolean: false,
  DropdownContent: ChartXAxisFieldSelectionDropdownContent,
};

const SORT_BY_ITEM: ChartSettingsItem = {
  id: CHART_CONFIGURATION_SETTING_IDS.PRIMARY_SORT_BY,
  label: msg`Sort by`,
  Icon: IconSortAscending,
  isBoolean: false,
  DropdownContent: ChartSortBySelectionDropdownContent,
};

const AGGREGATE_ITEM: ChartSettingsItem = {
  id: CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_AGGREGATE,
  label: msg`Aggregate`,
  Icon: IconChartBar,
  isBoolean: false,
  DropdownContent: ChartFieldSelectionForAggregateOperationDropdownContent,
};

const getChartConfiguration = () =>
  jotaiStore.get(
    pageLayoutDraftComponentState.atomFamily({
      instanceId: CHART_SETTINGS_STORY_DATA.pageLayoutId,
    }),
  ).tabs[0].widgets[0].configuration;

const meta: Meta<typeof ChartSettingsStory> = {
  title: 'Modules/SidePanel/PageLayout/ChartSettings/Navigation',
  component: ChartSettingsStory,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    ObjectMetadataItemsDecorator,
  ],
  parameters: { container: { width: 640, height: 600 } },
  beforeEach: () => initializeChartSettingsStory(),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const RelationAndCompositeNavigation: Story = {
  render: () => <ChartSettingsStory items={[GROUP_BY_ITEM]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', { name: /^Group by/ });
    const opportunity = getMockObjectMetadataItemOrThrow('opportunity');
    const pointOfContact = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: opportunity,
      fieldName: 'pointOfContact',
    });

    await userEvent.click(trigger);
    const fieldSearch = await body.findByRole('searchbox', {
      name: 'Search fields',
    });
    await userEvent.type(fieldSearch, 'point of contact');
    const relationOpener = body.getByRole('button', {
      name: 'Point of Contact',
    });
    await userEvent.click(relationOpener);
    const relationSearch = await body.findByRole('searchbox', {
      name: 'Search fields',
    });
    await userEvent.type(relationSearch, 'name');
    const compositeOpener = body.getByRole('button', {
      name: 'Name',
    });
    await userEvent.click(compositeOpener);
    await userEvent.click(
      await body.findByRole('button', {
        name: 'Name',
      }),
    );
    await waitFor(() => expect(compositeOpener).toHaveFocus());
    expect(relationSearch).toHaveValue('name');
    await userEvent.click(
      body.getByRole('button', {
        name: 'Point of Contact',
      }),
    );
    await waitFor(() => expect(relationOpener).toHaveFocus());
    expect(fieldSearch).toHaveValue('point of contact');

    await userEvent.click(relationOpener);
    await userEvent.click(
      await body.findByRole('button', {
        name: 'Name',
      }),
    );
    await userEvent.click(
      await body.findByRole('button', {
        name: 'First Name',
      }),
    );
    await waitFor(() => {
      expect(getChartConfiguration()).toMatchObject({
        primaryAxisGroupByFieldMetadataId: pointOfContact.id,
        primaryAxisGroupBySubFieldName: 'name.firstName',
      });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus();
    });
  },
};

export const AggregateRatioNavigation: Story = {
  beforeEach: () => initializeChartSettingsStory({ chartType: 'aggregate' }),
  render: () => <ChartSettingsStory items={[AGGREGATE_ITEM]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', { name: /^Aggregate/ });
    const opportunity = getMockObjectMetadataItemOrThrow('opportunity');
    const stage = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: opportunity,
      fieldName: 'stage',
    });

    await userEvent.click(trigger);
    await userEvent.type(
      await body.findByRole('searchbox', {
        name: 'Search fields',
      }),
      'stage',
    );
    await userEvent.click(
      body.getByRole('button', {
        name: 'Stage',
      }),
    );
    const ratioOpener = await body.findByRole('button', {
      name: 'Ratio',
    });
    await userEvent.click(ratioOpener);
    await userEvent.click(
      await body.findByRole('button', {
        name: 'Back to operations',
      }),
    );
    await waitFor(() => expect(ratioOpener).toHaveFocus());
    await userEvent.click(ratioOpener);
    const optionSearch = await body.findByRole('searchbox', {
      name: 'Search options',
    });
    await userEvent.type(optionSearch, 'customer');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(getChartConfiguration()).toMatchObject({
        aggregateFieldMetadataId: stage.id,
        aggregateOperation: AggregateOperations.COUNT,
        ratioAggregateConfig: {
          fieldMetadataId: stage.id,
          optionValue: 'CUSTOMER',
        },
      });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus();
    });
  },
};

export const ManualSortKeyboardReorder: Story = {
  render: () => <ChartSettingsStory items={[SORT_BY_ITEM]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', { name: /^Sort by/ });

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('button', {
        name: 'Manual',
      }),
    );
    const firstOption = await body.findByRole('button', {
      name: 'New',
    });
    firstOption.focus();
    await userEvent.keyboard(' ');
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
    await userEvent.keyboard(' ');
    await waitFor(() =>
      expect(getChartConfiguration()).toMatchObject({
        primaryAxisOrderBy: GraphOrderBy.MANUAL,
        primaryAxisManualSortOrder: [
          'SCREENING',
          'NEW',
          'MEETING',
          'PROPOSAL',
          'CUSTOMER',
        ],
      }),
    );
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(
      body.getByRole('button', { name: 'Reorder options' }),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('button', {
        name: 'Manual',
      }),
    );
    expect(
      await body.findByRole('button', {
        name: 'Screening',
      }),
    ).toBeVisible();
    expect(getChartConfiguration()).toMatchObject({
      primaryAxisManualSortOrder: [
        'SCREENING',
        'NEW',
        'MEETING',
        'PROPOSAL',
        'CUSTOMER',
      ],
    });
    await userEvent.keyboard('{Escape}');
  },
};
