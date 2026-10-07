import { PAGE_LAYOUT_TEST_INSTANCE_ID } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { buildDefaultBarChartConfiguration } from '@/page-layout/utils/buildDefaultBarChartConfiguration';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
import { ChartDataSourceDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartDataSourceDropdownContent';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import {
  type DashboardFilterBinding,
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

jest.mock(
  '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore',
  () => ({
    usePageLayoutIdFromContextStore: () => ({
      pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      recordId: 'dashboard-record-id',
      objectNameSingular: 'dashboard',
    }),
  }),
);

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

const getFieldIdOrThrow = (
  objectMetadataItem: { fields: { id: string; name: string }[] },
  fieldName: string,
) => {
  const field = objectMetadataItem.fields.find(
    (field) => field.name === fieldName,
  );

  if (!isDefined(field)) {
    throw new Error(`Expected a ${fieldName} field`);
  }

  return field.id;
};

const DATE_SLOT: DashboardFilterSlot = {
  id: 'date-slot',
  label: 'Date',
  filterType: 'DATE_TIME',
  defaultOperand: ViewFilterOperand.IS_RELATIVE,
};

const buildCompanyWidget = (
  dashboardFilterBindings?: Record<string, DashboardFilterBinding | null>,
) =>
  buildDraftPageLayoutWidget({
    id: 'company-widget',
    pageLayoutTabId: 'tab-1',
    title: 'Companies',
    type: WidgetType.GRAPH,
    configuration: {
      ...buildDefaultBarChartConfiguration({}),
      ...(isDefined(dashboardFilterBindings)
        ? { dashboardFilterBindings }
        : {}),
    },
    position: {
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 0,
      column: 0,
      rowSpan: 2,
      columnSpan: 2,
    },
    objectMetadataId: companyObjectMetadataItem.id,
  });

const getDraftAtom = () =>
  pageLayoutDraftComponentState.atomFamily({
    instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
  });

const getEditedWidget = () => {
  const widget = jotaiStore
    .get(getDraftAtom())
    .tabs.flatMap((tab) => tab.widgets)
    .find((widget) => widget.id === 'company-widget');

  if (!isDefined(widget)) {
    throw new Error('Expected the edited widget in the draft');
  }

  return widget;
};

const renderDataSourceDropdown = async ({
  dashboardFilters,
  dashboardFilterBindings,
}: {
  dashboardFilters: DashboardFilterSlot[] | null;
  dashboardFilterBindings?: Record<string, DashboardFilterBinding | null>;
}) => {
  resetJotaiStore();

  jotaiStore.set(getDraftAtom(), {
    ...makeDraft([
      makeTab(
        'tab-1',
        [buildCompanyWidget(dashboardFilterBindings)],
        0,
        PageLayoutTabLayoutMode.GRID,
      ),
    ]),
    id: PAGE_LAYOUT_TEST_INSTANCE_ID,
    type: PageLayoutType.DASHBOARD,
    dashboardFilters,
  });

  jotaiStore.set(
    pageLayoutEditingWidgetIdComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    'company-widget',
  );

  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider colorScheme="light">
        <JotaiProvider store={jotaiStore}>
          <JestObjectMetadataItemSetter>
            <DropdownComponentInstanceContext.Provider
              value={{ instanceId: 'chart-data-source-dropdown' }}
            >
              <ChartDataSourceDropdownContent />
              <div data-testid="metadata-loaded" />
            </DropdownComponentInstanceContext.Provider>
          </JestObjectMetadataItemSetter>
        </JotaiProvider>
      </ThemeProvider>
    </I18nProvider>,
  );

  await screen.findByTestId('metadata-loaded');
};

describe('ChartDataSourceDropdownContent', () => {
  it('recomputes the dashboard filter bindings for the new object', async () => {
    await renderDataSourceDropdown({
      dashboardFilters: [DATE_SLOT],
      dashboardFilterBindings: {
        [DATE_SLOT.id]: {
          fieldMetadataId: getFieldIdOrThrow(
            companyObjectMetadataItem,
            'createdAt',
          ),
        },
      },
    });

    await userEvent.setup().click(
      await screen.findByRole('option', {
        name: personObjectMetadataItem.labelPlural,
      }),
    );

    await waitFor(() =>
      expect(getEditedWidget().objectMetadataId).toBe(
        personObjectMetadataItem.id,
      ),
    );

    expect(getEditedWidget().configuration).toMatchObject({
      filter: {},
      dashboardFilterBindings: {
        [DATE_SLOT.id]: {
          fieldMetadataId: getFieldIdOrThrow(
            personObjectMetadataItem,
            'createdAt',
          ),
        },
      },
    });
  });

  it('leaves bindings alone while the dashboard still uses the built-in filters', async () => {
    await renderDataSourceDropdown({ dashboardFilters: null });

    await userEvent.setup().click(
      await screen.findByRole('option', {
        name: personObjectMetadataItem.labelPlural,
      }),
    );

    await waitFor(() =>
      expect(getEditedWidget().objectMetadataId).toBe(
        personObjectMetadataItem.id,
      ),
    );

    expect(getEditedWidget().configuration).not.toHaveProperty(
      'dashboardFilterBindings',
    );
  });
});
