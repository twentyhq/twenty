import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { DashboardFilterBar } from '@/page-layout/dashboard-filters/components/DashboardFilterBar';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { buildDefaultBarChartConfiguration } from '@/page-layout/utils/buildDefaultBarChartConfiguration';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import {
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ThemeProvider } from 'twenty-ui/theme';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

const getFieldWithOptionsOrThrow = (
  objectMetadataItem: { nameSingular: string; fields: FieldMetadataItem[] },
  fieldName: string,
) => {
  const field = objectMetadataItem.fields.find(
    (field) => field.name === fieldName,
  );

  if (
    !isDefined(field) ||
    !isDefined(field.options) ||
    field.options.length === 0
  ) {
    throw new Error(
      `Expected the ${objectMetadataItem.nameSingular} mock to have a ${fieldName} field with options`,
    );
  }

  return { field, firstOption: field.options[0] };
};

const { field: stageField, firstOption: firstStageOption } =
  getFieldWithOptionsOrThrow(opportunityObjectMetadataItem, 'stage');

const { field: workPreferenceField, firstOption: firstWorkPreferenceOption } =
  getFieldWithOptionsOrThrow(personObjectMetadataItem, 'workPreference');

const STAGE_SLOT: DashboardFilterSlot = {
  id: 'stage-slot',
  label: 'Stage',
  filterType: 'SELECT',
  defaultOperand: ViewFilterOperand.IS,
};

const WORK_PREFERENCE_SLOT: DashboardFilterSlot = {
  id: 'work-preference-slot',
  label: 'Work preference',
  filterType: 'MULTI_SELECT',
  defaultOperand: ViewFilterOperand.CONTAINS,
};

const dashboardFilterValuesAtom =
  dashboardFilterValuesComponentState.atomFamily({
    instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
  });

// Dashboards live at /object/dashboard/:id, a route without :objectNamePlural.
const renderDashboardFilterBar = async ({
  slot,
  field,
  objectMetadataId,
}: {
  slot: DashboardFilterSlot;
  field: FieldMetadataItem;
  objectMetadataId: string;
}) => {
  resetJotaiStore();

  const chartWidget = buildDraftPageLayoutWidget({
    id: 'chart-widget',
    pageLayoutTabId: 'tab-1',
    title: 'Chart',
    type: WidgetType.GRAPH,
    configuration: {
      ...buildDefaultBarChartConfiguration({}),
      primaryAxisGroupByFieldMetadataId: field.id,
      dashboardFilterBindings: {
        [slot.id]: { fieldMetadataId: field.id },
      },
    },
    position: {
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 0,
      column: 0,
      rowSpan: 2,
      columnSpan: 2,
    },
    objectMetadataId,
  });

  jotaiStore.set(
    pageLayoutPersistedComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    {
      id: PAGE_LAYOUT_TEST_INSTANCE_ID,
      name: 'Dashboard',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      dashboardFilters: [slot],
      tabs: [makeTab('tab-1', [chartWidget], 0, PageLayoutTabLayoutMode.GRID)],
    } as PageLayout,
  );

  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider colorScheme="light">
        <JotaiProvider store={jotaiStore}>
          <MemoryRouter
            initialEntries={[
              '/object/dashboard/20202020-0000-4000-8000-000000000001',
            ]}
          >
            <JestObjectMetadataItemSetter>
              <PageLayoutTestWrapper
                store={jotaiStore}
                layoutType={PageLayoutType.DASHBOARD}
              >
                <DashboardFilterBar />
                <div data-testid="metadata-loaded" />
              </PageLayoutTestWrapper>
            </JestObjectMetadataItemSetter>
          </MemoryRouter>
        </JotaiProvider>
      </ThemeProvider>
    </I18nProvider>,
  );

  await screen.findByTestId('metadata-loaded');
};

describe('DashboardFilter select chips on a dashboard route', () => {
  it('opens the SELECT chip with the field options and writes the pick as IS', async () => {
    await renderDashboardFilterBar({
      slot: STAGE_SLOT,
      field: stageField,
      objectMetadataId: opportunityObjectMetadataItem.id,
    });

    const user = userEvent.setup();

    await user.click(screen.getByText('Stage'));
    await user.click(
      await screen.findByRole('option', { name: firstStageOption.label }),
    );

    await waitFor(() =>
      expect(jotaiStore.get(dashboardFilterValuesAtom)[STAGE_SLOT.id]).toEqual({
        operand: ViewFilterOperand.IS,
        value: JSON.stringify([firstStageOption.value]),
      }),
    );
  });

  it('opens the MULTI_SELECT chip with the field options and writes the pick as CONTAINS', async () => {
    await renderDashboardFilterBar({
      slot: WORK_PREFERENCE_SLOT,
      field: workPreferenceField,
      objectMetadataId: personObjectMetadataItem.id,
    });

    const user = userEvent.setup();

    await user.click(screen.getByText('Work preference'));
    await user.click(
      await screen.findByRole('option', {
        name: firstWorkPreferenceOption.label,
      }),
    );

    await waitFor(() =>
      expect(
        jotaiStore.get(dashboardFilterValuesAtom)[WORK_PREFERENCE_SLOT.id],
      ).toEqual({
        operand: ViewFilterOperand.CONTAINS,
        value: JSON.stringify([firstWorkPreferenceOption.value]),
      }),
    );
  });
});
